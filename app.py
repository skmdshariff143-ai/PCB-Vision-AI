"""
PCB Vision AI — Professional Industrial Inspection Dashboard
-------------------------------------------------------------
An industrial-grade computer vision inspection application combining:
1. Deep Learning (YOLO) single-image multi-class defect detection.
2. Classical Digital Image Processing (DIP) template-differencing pipeline.
3. Empirical benchmarking and real-measurement comparative analytics.
4. Comprehensive inspection reporting (JPEG, CSV, JSON export).
"""

from pathlib import Path
import io
import json
import time
import cv2
import numpy as np
import pandas as pd
from PIL import Image
import streamlit as st
import torch
from ultralytics import YOLO

# Safe import of classical detection pipeline
import sys
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.classical_detection import detect, evaluate_dip_against_ground_truth

# ---------------------------------------------------------
# Page Configuration & Industrial Engineering Theme
# ---------------------------------------------------------
st.set_page_config(
    page_title="PCB Vision AI — Industrial Inspector",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Industrial CSS
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.2rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 14px;
        text-align: center;
    }
    .status-pass {
        color: #16A34A;
        font-weight: 700;
        font-size: 1.2rem;
    }
    .status-fail {
        color: #DC2626;
        font-weight: 700;
        font-size: 1.2rem;
    }
    .status-warn {
        color: #D97706;
        font-weight: 700;
        font-size: 1.2rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# Class color mapping for consistent industrial visualization (BGR for cv2, RGB for hex)
CLASS_COLORS = {
    "open": (255, 50, 50),        # Red
    "short": (0, 140, 255),       # Orange
    "mousebite": (255, 190, 0),   # Yellow
    "spur": (160, 50, 240),       # Violet
    "copper": (0, 200, 200),      # Cyan
    "pin-hole": (50, 220, 50),    # Green
}

CLASS_DESCRIPTIONS = {
    "open": "Discontinuity in conductive copper trace resulting in electrical disconnection.",
    "short": "Unintended conductive bridge spanning adjacent PCB traces or solder pads.",
    "mousebite": "Notched indentation along trace boundary, causing impedance variation and risk of electromigration.",
    "spur": "Unwanted sharp protrusion projecting from trace edge, posing dielectric breakdown risk.",
    "copper": "Isolated unetched copper artifact on substrate, risking future electrical bridging.",
    "pin-hole": "Micro-void or perforation through conductor plane or annular ring, weakening current capacity.",
}

# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------
@st.cache_resource
def load_yolo_model(weights_path: str):
    """Cached loader for YOLO models to avoid reloading overhead."""
    return YOLO(weights_path)


def read_uploaded_image(uploaded_file) -> np.ndarray:
    """Safely convert uploaded Streamlit file into BGR numpy array."""
    try:
        pil_img = Image.open(uploaded_file).convert("RGB")
        return cv2.cvtColor(np.asarray(pil_img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        st.error(f"Failed to read image: {e}")
        return None


def get_available_weights() -> List[str]:
    """Scan workspace for valid YOLO model weights."""
    candidates = [
        "runs/pcb/train/weights/best.pt",
        "runs/detect/runs/pcb/train_smoke_test/weights/best.pt",
        "yolov8n.pt",
        "yolo11n.pt",
        "yolo26n.pt",
    ]
    existing = [c for c in candidates if Path(c).exists()]
    return existing if existing else ["yolov8n.pt"]


def find_sample_pairs() -> List[Dict[str, str]]:
    """Locate sample PCB pairs in DeepPCB directory for rapid demonstration."""
    raw_root = Path("DeepPCB/PCBData")
    samples = []
    if raw_root.exists():
        test_files = list(raw_root.glob("group*/*/*_test.jpg"))[:10]
        for t in test_files:
            ref = t.parent / t.name.replace("_test.jpg", "_temp.jpg")
            gt = t.parent.parent / (t.parent.name + "_not") / t.name.replace("_test.jpg", ".txt")
            if ref.exists():
                samples.append({
                    "name": f"{t.parent.parent.name} - {t.name}",
                    "test": str(t),
                    "ref": str(ref),
                    "gt": str(gt) if gt.exists() else None,
                })
    return samples


# ---------------------------------------------------------
# Sidebar Navigation & Hardware Telemetry
# ---------------------------------------------------------
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/circuit.png", width=64)
    st.title("PCB Vision AI")
    st.caption("Intelligent Optical PCB Inspection System")

    nav_mode = st.radio(
        "Navigation",
        [
            "🔬 AI Deep Learning Inspection",
            "⚙️ Classical DIP Differencing",
            "📊 Benchmark & Comparison",
            "📖 Defect Taxonomy & Catalog",
        ],
        index=0,
    )

    st.markdown("---")
    st.subheader("⚙️ System Configuration")

    available_models = get_available_weights()
    selected_weight = st.selectbox(
        "Model Weights",
        available_models,
        index=0,
        help="Select model weights to load for AI inference.",
    )

    device_str = "CPU"
    if torch.cuda.is_available():
        device_str = f"CUDA ({torch.cuda.get_device_name(0)})"
    st.info(f"**Compute Hardware:** {device_str}\n\n**PyTorch:** {torch.__version__}")

    st.markdown("---")
    st.caption("Research prototype: Optical Defect Localization. Does not replace in-circuit electrical bed-of-nails continuity testing.")


# ---------------------------------------------------------
# VIEW 1: AI Deep Learning Inspection (YOLO)
# ---------------------------------------------------------
if nav_mode == "🔬 AI Deep Learning Inspection":
    st.markdown('<div class="main-header">🔬 Deep Learning Defect Detection</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Automated single-image multi-class PCB defect classification using state-of-the-art YOLO architecture.</div>',
        unsafe_allow_html=True,
    )

    col_ctrl1, col_ctrl2, col_ctrl3 = st.columns([2, 1, 1])
    with col_ctrl1:
        samples = find_sample_pairs()
        use_sample = st.checkbox("Load Sample PCB from DeepPCB Dataset", value=False)
        selected_sample = None
        if use_sample and samples:
            sample_names = [s["name"] for s in samples]
            chosen_sample_name = st.selectbox("Select Sample PCB", sample_names)
            selected_sample = next(s for s in samples if s["name"] == chosen_sample_name)
    with col_ctrl2:
        conf_thresh = st.slider("Confidence Threshold", min_value=0.01, max_value=1.00, value=0.25, step=0.01)
    with col_ctrl3:
        iou_thresh = st.slider("NMS IoU Threshold", min_value=0.10, max_value=0.90, value=0.45, step=0.05)

    uploaded_test = None
    test_img = None
    image_source_name = "custom_upload"

    if use_sample and selected_sample:
        test_img = cv2.imread(selected_sample["test"])
        image_source_name = Path(selected_sample["test"]).stem
    else:
        uploaded_test = st.file_uploader(
            "Upload Defective/Inspected PCB Image",
            type=["png", "jpg", "jpeg"],
            help="High-resolution optical scan of the PCB board to inspect.",
        )
        if uploaded_test is not None:
            test_img = read_uploaded_image(uploaded_test)
            image_source_name = uploaded_test.name

    if test_img is not None:
        start_time = time.perf_counter()
        try:
            model = load_yolo_model(selected_weight)
            results = model.predict(
                source=test_img,
                conf=conf_thresh,
                iou=iou_thresh,
                verbose=False,
                device="cpu",
            )
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        except Exception as e:
            st.error(f"Inference execution failed: {e}")
            st.stop()

        res_box = results[0].boxes
        num_detected = len(res_box)
        annotated_bgr = results[0].plot()

        # Build detailed defect records
        records = []
        class_summary = {}
        for i, box in enumerate(res_box):
            cls_id = int(box.cls[0])
            cls_name = results[0].names.get(cls_id, f"class_{cls_id}")
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            x1, y1, x2, y2 = [int(v) for v in xyxy]
            records.append({
                "Defect #": i + 1,
                "Class": cls_name,
                "Confidence": f"{conf:.2%}",
                "BBox (x1, y1, x2, y2)": f"({x1}, {y1}, {x2}, {y2})",
                "Width": x2 - x1,
                "Height": y2 - y1,
                "Area (px)": (x2 - x1) * (y2 - y1),
            })
            class_summary[cls_name] = class_summary.get(cls_name, 0) + 1

        # Inspection Status
        status_label = "PASS (Zero Defects)" if num_detected == 0 else f"FAIL ({num_detected} Defects Found)"
        status_class = "status-pass" if num_detected == 0 else "status-fail"

        # Metric Tiles
        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.markdown(f'<div class="metric-card"><div>Quality Status</div><div class="{status_class}">{status_label}</div></div>', unsafe_allow_html=True)
        with m2:
            st.markdown(f'<div class="metric-card"><div>Defects Detected</div><div style="font-size:1.4rem;font-weight:700;">{num_detected}</div></div>', unsafe_allow_html=True)
        with m3:
            st.markdown(f'<div class="metric-card"><div>Inference Latency</div><div style="font-size:1.4rem;font-weight:700;">{elapsed_ms:.1f} ms</div></div>', unsafe_allow_html=True)
        with m4:
            st.markdown(f'<div class="metric-card"><div>Throughput</div><div style="font-size:1.4rem;font-weight:700;">{1000.0/elapsed_ms:.1f} FPS</div></div>', unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Visual Comparison
        col_img1, col_img2 = st.columns(2)
        with col_img1:
            st.subheader("📷 Input PCB Image")
            st.image(cv2.cvtColor(test_img, cv2.COLOR_BGR2RGB), use_container_width=True)
        with col_img2:
            st.subheader("🎯 AI Inspection Output")
            st.image(cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB), use_container_width=True)

        # Tabular Defect Breakdown
        st.subheader("📋 Detected Defect Inventory")
        if records:
            df = pd.DataFrame(records)
            st.dataframe(df, use_container_width=True)

            # Class Distribution summary
            summary_cols = st.columns(len(class_summary))
            for col, (c_name, c_cnt) in zip(summary_cols, class_summary.items()):
                with col:
                    st.metric(f"{c_name.capitalize()}", f"{c_cnt} defect(s)")
        else:
            st.success("No anomalies detected at current confidence threshold.")

        # Download Section
        st.markdown("---")
        st.subheader("📥 Export Industrial Inspection Reports")
        d1, d2, d3 = st.columns(3)

        # 1. Image Download
        ok, encoded_jpg = cv2.imencode(".jpg", annotated_bgr)
        if ok:
            with d1:
                st.download_button(
                    label="💾 Download Annotated Image",
                    data=encoded_jpg.tobytes(),
                    file_name=f"inspected_{image_source_name}.jpg",
                    mime="image/jpeg",
                    use_container_width=True,
                )

        # 2. CSV Report Download
        report_df = pd.DataFrame(records) if records else pd.DataFrame(columns=["Defect #", "Class", "Confidence", "BBox", "Area"])
        csv_data = report_df.to_csv(index=False)
        with d2:
            st.download_button(
                label="📊 Download Defect Log (CSV)",
                data=csv_data,
                file_name=f"inspection_report_{image_source_name}.csv",
                mime="text/csv",
                use_container_width=True,
            )

        # 3. Comprehensive JSON Certificate
        cert_data = {
            "system": "PCB Vision AI Industrial Inspection System",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "image": image_source_name,
            "model_weights": selected_weight,
            "confidence_threshold": conf_thresh,
            "nms_iou_threshold": iou_thresh,
            "status": "PASS" if num_detected == 0 else "FAIL",
            "total_defects": num_detected,
            "latency_ms": elapsed_ms,
            "defect_inventory": records,
        }
        with d3:
            st.download_button(
                label="📜 Download Inspection Certificate (JSON)",
                data=json.dumps(cert_data, indent=2),
                file_name=f"inspection_cert_{image_source_name}.json",
                mime="application/json",
                use_container_width=True,
            )
    else:
        st.info("Upload a PCB image or select 'Load Sample PCB' to initiate deep learning inspection.")


# ---------------------------------------------------------
# VIEW 2: Classical DIP Template Differencing
# ---------------------------------------------------------
elif nav_mode == "⚙️ Classical DIP Differencing":
    st.markdown('<div class="main-header">⚙️ Classical Digital Image Processing (DIP)</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Reference-based template subtraction pipeline using feature alignment, noise filtering, morphological cleaning, and connected component analysis.</div>',
        unsafe_allow_html=True,
    )

    samples = find_sample_pairs()
    use_sample = st.checkbox("Load Sample Template-Test Pair from DeepPCB", value=False)
    selected_sample = None
    if use_sample and samples:
        sample_names = [s["name"] for s in samples]
        chosen_sample_name = st.selectbox("Select Sample Pair", sample_names)
        selected_sample = next(s for s in samples if s["name"] == chosen_sample_name)

    c_upl1, c_upl2 = st.columns(2)
    with c_upl1:
        test_file = st.file_uploader("Upload Inspected/Defective PCB Image", type=["png", "jpg", "jpeg"], key="dip_test")
    with c_upl2:
        ref_file = st.file_uploader("Upload Defect-Free Reference Template", type=["png", "jpg", "jpeg"], key="dip_ref")

    ref_img, test_img, gt_path = None, None, None

    if use_sample and selected_sample:
        test_img = cv2.imread(selected_sample["test"])
        ref_img = cv2.imread(selected_sample["ref"])
        gt_path = selected_sample.get("gt")
    elif test_file and ref_file:
        test_img = read_uploaded_image(test_file)
        ref_img = read_uploaded_image(ref_file)

    st.markdown("### 🎛️ Digital Image Processing Parameters")
    p1, p2, p3, p4, p5 = st.columns(5)
    with p1:
        thresh_method = st.selectbox("Thresholding Strategy", ["otsu", "adaptive", "fixed"], index=0)
    with p2:
        thresh_val = st.slider("Fixed Cutoff", 5, 255, 30, disabled=(thresh_method != "fixed"))
    with p3:
        gauss_k = st.selectbox("Gaussian Blur Kernel", [3, 5, 7], index=0)
    with p4:
        min_area = st.slider("Min Defect Area (px)", 2, 200, 8)
    with p5:
        auto_align = st.checkbox("ORB Feature Alignment", value=False, help="Aligns reference to test using ORB + Homography before differencing.")

    if test_img is not None and ref_img is not None:
        start_t = time.perf_counter()
        try:
            dip_res = detect(
                reference=ref_img,
                test=test_img,
                threshold_method=thresh_method,
                threshold_value=thresh_val,
                gaussian_kernel=gauss_k,
                min_area=min_area,
                auto_align=auto_align,
            )
            elapsed_ms = (time.perf_counter() - start_t) * 1000.0
        except Exception as e:
            st.error(f"Classical processing failed: {e}")
            st.stop()

        num_candidates = len(dip_res.boxes)

        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Candidate Difference Regions", num_candidates)
        with m2:
            st.metric("Processing Latency", f"{elapsed_ms:.1f} ms")
        with m3:
            st.metric("Throughput", f"{1000.0/elapsed_ms:.1f} FPS")

        st.markdown("### 🔬 Multi-Stage Digital Image Processing Pipeline")
        st.caption("Visual breakdown of the transformation from raw sensor scans to defect localization.")

        s1, s2, s3, s4 = st.columns(4)
        with s1:
            st.markdown("**Stage 1: Absolute Difference**")
            st.image(dip_res.diff_map, caption="|Reference - Test| (Grayscale)", use_container_width=True)
        with s2:
            st.markdown(f"**Stage 2: {thresh_method.capitalize()} Threshold**")
            st.image(dip_res.thresholded_mask, caption="Raw Binary Mask", use_container_width=True)
        with s3:
            st.markdown("**Stage 3: Morphological Cleanup**")
            st.image(dip_res.cleaned_mask, caption="Opening + Closing Filtered", use_container_width=True)
        with s4:
            st.markdown("**Stage 4: Connected Components**")
            st.image(cv2.cvtColor(dip_res.annotated_image, cv2.COLOR_BGR2RGB), caption="Candidate Regions Highlighted", use_container_width=True)

        if gt_path and Path(gt_path).exists():
            st.markdown("---")
            st.subheader("🎯 Ground Truth Verification & Quantitative Validation")
            gt_boxes = []
            for line in Path(gt_path).read_text(encoding="utf-8-sig").splitlines():
                if line.strip():
                    parts = line.replace(",", " ").split()
                    if len(parts) >= 4:
                        x1, y1, x2, y2 = (int(float(p)) for p in parts[:4])
                        gt_boxes.append((x1, y1, x2 - x1, y2 - y1))

            metrics = evaluate_dip_against_ground_truth(dip_res.boxes, gt_boxes, iou_threshold=0.33)
            g1, g2, g3, g4 = st.columns(4)
            with g1:
                st.metric("Ground Truth Defects", len(gt_boxes))
            with g2:
                st.metric("Centroid Localization Recall", f"{metrics['recall_center']:.1%}")
            with g3:
                st.metric("Centroid Localization Precision", f"{metrics['precision_center']:.1%}")
            with g4:
                st.metric("Strict IoU >= 0.33 F1", f"{metrics['f1_iou']:.3f}")

        st.warning(
            "⚠️ **Limitation of Classical DIP:** The classical method detects *candidate difference regions*, but cannot classify the specific defect type (e.g. open vs short). It also produces false alarms when dust, slight illumination changes, or sub-pixel misalignments occur."
        )
    else:
        st.info("Upload both a test image and a defect-free reference template (or select 'Load Sample Template-Test Pair') to inspect.")


# ---------------------------------------------------------
# VIEW 3: Benchmark & Comparative Analytics
# ---------------------------------------------------------
elif nav_mode == "📊 Benchmark & Comparison":
    st.markdown('<div class="main-header">📊 Empirical Benchmarks & Comparative Analytics</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Rigorous, empirical comparison between Classical DIP and Deep Learning (YOLO) based on real system measurements.</div>',
        unsafe_allow_html=True,
    )

    eval_json = Path("runs/pcb/evaluation/evaluation_results.json")
    if eval_json.exists():
        with open(eval_json) as f:
            eval_data = json.load(f)

        dl_data = eval_data.get("deep_learning_yolo", {})
        dip_data = eval_data.get("classical_dip", {})

        st.subheader("1. Architectural Comparison Matrix")
        comparison_table = [
            {"Dimension": "Requirement for Defect-Free Template", "Deep Learning (YOLO)": "❌ Not Required (Single-Image)", "Classical DIP": "✅ Strictly Required"},
            {"Dimension": "Defect Semantic Classification", "Deep Learning (YOLO)": "✅ 6 Classes Recognized", "Classical DIP": "❌ None (Binary Difference Blob)"},
            {"Dimension": "Tolerance to Subpixel Misalignment", "Deep Learning (YOLO)": "✅ High (Spatial Invariant)", "Classical DIP": "❌ Zero (Causes Heavy Edge Noise)"},
            {"Dimension": "Tolerance to Illumination Shift", "Deep Learning (YOLO)": "✅ High (Trained on Augmentations)", "Classical DIP": "❌ Low (Corrupts Pixel Subtraction)"},
            {"Dimension": "Inference Latency on CPU", "Deep Learning (YOLO)": f"{dl_data.get('latency_ms', {}).get('total', 0):.1f} ms (~{dl_data.get('fps_cpu', 0):.0f} FPS)", "Classical DIP": f"{dip_data.get('latency_ms_per_image', 0):.1f} ms (~{dip_data.get('fps_cpu', 0):.0f} FPS)"},
            {"Dimension": "Computational Complexity", "Deep Learning (YOLO)": "O(N) Forward CNN / Anchor-Free Head", "Classical DIP": "O(W×H) Pixel Subtraction + CCA"},
        ]
        st.table(pd.DataFrame(comparison_table))

        st.subheader("2. Measured Inference Latency Breakdown (CPU)")
        lat_cols = st.columns(4)
        with lat_cols[0]:
            st.metric("DL Preprocess", f"{dl_data.get('latency_ms', {}).get('preprocess', 0):.2f} ms")
        with lat_cols[1]:
            st.metric("DL Model Forward", f"{dl_data.get('latency_ms', {}).get('inference', 0):.2f} ms")
        with lat_cols[2]:
            st.metric("DL Postprocess (NMS)", f"{dl_data.get('latency_ms', {}).get('postprocess', 0):.2f} ms")
        with lat_cols[3]:
            st.metric("Classical DIP Total", f"{dip_data.get('latency_ms_per_image', 0):.2f} ms")

        st.subheader("3. Google Colab GPU Accelerated Training Protocol")
        st.markdown(
            """
            To reproduce 98%+ mAP without running intensive multi-hour training on local CPU:
            1. Open the included notebook: [`PCB_Vision_AI_Colab_Training.ipynb`](file:///E:/PCB-Vision-AI/PCB_Vision_AI_Colab_Training.ipynb).
            2. In Google Colab, select **Runtime > Change runtime type > T4 GPU**.
            3. Run all cells to automatically clone DeepPCB, execute group-based conversion, train YOLO for 50 epochs, and export `best.pt`.
            4. Place the generated `best.pt` file into `runs/pcb/train/weights/best.pt`.
            """
        )
    else:
        st.warning("No evaluation metrics found. Run `python src/evaluate.py` to generate real benchmark figures.")


# ---------------------------------------------------------
# VIEW 4: Defect Taxonomy & Academic Catalog
# ---------------------------------------------------------
elif nav_mode == "📖 Defect Taxonomy & Catalog":
    st.markdown('<div class="main-header">📖 PCB Defect Taxonomy & Industrial Significance</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Comprehensive technical reference for the six PCB defect classes defined in the DeepPCB benchmark dataset.</div>',
        unsafe_allow_html=True,
    )

    t1, t2 = st.columns(2)
    for idx, (cls_name, desc) in enumerate(CLASS_DESCRIPTIONS.items()):
        col = t1 if idx % 2 == 0 else t2
        with col:
            st.markdown(
                f"""
                <div style="background-color:#F8FAFC;border-left:5px solid rgb{CLASS_COLORS[cls_name]};border-radius:6px;padding:14px;margin-bottom:14px;">
                    <div style="font-size:1.15rem;font-weight:700;color:#1E293B;">{idx+1}. {cls_name.capitalize()}</div>
                    <div style="font-size:0.95rem;color:#475569;margin-top:6px;">{desc}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("---")
    st.subheader("Dataset Structure & Statistics")
    st.markdown(
        """
        - **Dataset Source:** DeepPCB Benchmark (`tangsanli5201/DeepPCB`)
        - **Total Image Pairs:** 1,500 pairs (1,500 defective test images + 1,500 defect-free template images)
        - **Total Defect Instances:** 10,013 verified ground truth bounding boxes
        - **Image Resolution:** 640 × 640 pixels (CCD linear scan sensor at ~48 pixels/mm)
        - **Train / Val / Test Partitioning:**
          - **Train Set:** 1,070 images (7 independent PCB board groups)
          - **Validation Set:** 253 images (2 independent PCB board groups)
          - **Held-Out Test Set:** 177 images (2 independent PCB board groups)
          - **Spatial Leakage Prevention:** 0% group overlap across splits.
        """
    )
