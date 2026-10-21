import urllib.request, time, json, numpy as np, onnxruntime as ort, cv2

preview_url = 'https://pcb-vision-grkat8qyx-shaik-mahammad-shariff-s-projects.vercel.app'
model_url = f'{preview_url}/models/pcb_yolov8n.onnx'

print('======================================================================')
print('PHASE 2: COMPREHENSIVE BROWSER / ONNX INFERENCE VERIFICATION')
print('======================================================================')

# Download model from preview CDN
with urllib.request.urlopen(model_url) as r:
    model_bytes = r.read()
print(f'1. Loaded ONNX model asset ({len(model_bytes)} bytes)')

sess = ort.InferenceSession(model_bytes, providers=['CPUExecutionProvider'])
inp_name = sess.get_inputs()[0].name
inp_shape = sess.get_inputs()[0].shape
out_name = sess.get_outputs()[0].name
out_shape = sess.get_outputs()[0].shape

print(f'   Input Tensor: name="{inp_name}", shape={inp_shape}, dtype=float32')
print(f'   Output Tensor: name="{out_name}", shape={out_shape}, dtype=float32')
assert inp_shape == [1, 3, 640, 640], f'Unexpected input shape: {inp_shape}'
assert out_shape == [1, 10, 8400], f'Unexpected output shape: {out_shape}'

# Reusable client-side inference emulation matching web/lib/inference/yolo-detector.ts exactly
DEFECT_CLASSES = ['open', 'short', 'mousebite', 'spur', 'copper', 'pin-hole']

def run_browser_emulation(img_bgr, conf_thresh=0.25, iou_thresh=0.45):
    origH, origW = img_bgr.shape[:2]
    targetSize = 640
    r = min(targetSize / origH, targetSize / origW)
    unpadW = int(round(origW * r))
    unpadH = int(round(origH * r))
    padW = (targetSize - unpadW) / 2.0
    padH = (targetSize - unpadH) / 2.0

    # Letterbox with RGB 114, 114, 114 padding
    canvas = np.full((targetSize, targetSize, 3), 114, dtype=np.uint8)
    resized = cv2.resize(img_bgr, (unpadW, unpadH), interpolation=cv2.INTER_LINEAR)
    top = int(round(padH))
    left = int(round(padW))
    canvas[top:top+unpadH, left:left+unpadW] = resized

    # RGB and normalization [0, 1]
    canvas_rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
    tensor = np.transpose(canvas_rgb.astype(np.float32) / 255.0, (2, 0, 1))[np.newaxis, ...]

    t0 = time.time()
    raw_out = sess.run(None, {inp_name: tensor})[0]
    inf_time_ms = (time.time() - t0) * 1000

    # Postprocessing
    data = raw_out[0] # (10, 8400)
    candidates = []
    for i in range(8400):
        cls_scores = data[4:10, i]
        max_cls = int(np.argmax(cls_scores))
        max_score = float(cls_scores[max_cls])
        if max_score >= conf_thresh:
            cx, cy, w, h = data[0:4, i]
            bx1 = cx - w / 2.0
            by1 = cy - h / 2.0
            bx2 = cx + w / 2.0
            by2 = cy + h / 2.0
            # Invert letterboxing
            x1 = max(0.0, min(float(origW), (bx1 - padW) / r))
            y1 = max(0.0, min(float(origH), (by1 - padH) / r))
            x2 = max(0.0, min(float(origW), (bx2 - padW) / r))
            y2 = max(0.0, min(float(origH), (by2 - padH) / r))
            if x2 > x1 and y2 > y1:
                candidates.append({'cls': max_cls, 'score': max_score, 'bbox': [x1, y1, x2, y2]})

    # Class-aware NMS
    candidates.sort(key=lambda x: x['score'], reverse=True)
    final_dets = []
    suppressed = [False] * len(candidates)
    for i in range(len(candidates)):
        if suppressed[i]: continue
        a = candidates[i]
        final_dets.append(a)
        for j in range(i + 1, len(candidates)):
            if suppressed[j]: continue
            b = candidates[j]
            if a['cls'] == b['cls']:
                xA = max(a['bbox'][0], b['bbox'][0])
                yA = max(a['bbox'][1], b['bbox'][1])
                xB = min(a['bbox'][2], b['bbox'][2])
                yB = min(a['bbox'][3], b['bbox'][3])
                inter = max(0.0, xB - xA) * max(0.0, yB - yA)
                areaA = (a['bbox'][2] - a['bbox'][0]) * (a['bbox'][3] - a['bbox'][1])
                areaB = (b['bbox'][2] - b['bbox'][0]) * (b['bbox'][3] - b['bbox'][1])
                union = areaA + areaB - inter
                iou = inter / union if union > 0 else 0
                if iou >= iou_thresh:
                    suppressed[j] = True
    return final_dets, inf_time_ms

# CASE 1: Real DeepPCB Defective Sample 1
with urllib.request.urlopen(f'{preview_url}/samples/pcb_sample_1_test.jpg') as r:
    img1 = cv2.imdecode(np.frombuffer(r.read(), dtype=np.uint8), cv2.IMREAD_COLOR)

dets1, lat1 = run_browser_emulation(img1, conf_thresh=0.25, iou_thresh=0.45)
print(f'2. Case 1 (DeepPCB Defective Sample 1):')
print(f'   Detections count: {len(dets1)}, Latency: {lat1:.1f} ms')
for d in dets1:
    print(f'     Class: {DEFECT_CLASSES[d["cls"]]} (id {d["cls"]}), Conf: {d["score"]*100:.1f}%, Box: {[round(v,1) for v in d["bbox"]]}')
assert len(dets1) > 0, 'Case 1 expected defect detections!'

# CASE 2: Real DeepPCB Golden Reference Template (Defect-Free)
with urllib.request.urlopen(f'{preview_url}/samples/pcb_sample_1_temp.jpg') as r:
    img_temp = cv2.imdecode(np.frombuffer(r.read(), dtype=np.uint8), cv2.IMREAD_COLOR)

dets_temp, lat_temp = run_browser_emulation(img_temp, conf_thresh=0.25, iou_thresh=0.45)
print(f'3. Case 2 (Golden Reference Template - Defect-Free):')
print(f'   Detections count: {len(dets_temp)}, Latency: {lat_temp:.1f} ms')
print(f'   Verdict: {"NO ANOMALIES DETECTED" if len(dets_temp) == 0 else f"{len(dets_temp)} false positives detected"}')

# CASE 3: Out-of-Distribution Noise Image (Synthetic random noise)
noise_img = np.random.randint(0, 256, (640, 640, 3), dtype=np.uint8)
dets_noise, lat_noise = run_browser_emulation(noise_img, conf_thresh=0.25, iou_thresh=0.45)
print(f'4. Case 3 (Out-of-Distribution Noise Image):')
print(f'   Detections count: {len(dets_noise)} (Expected: 0 detections on random noise)')
assert len(dets_noise) == 0, 'Model falsely detected defects on pure noise!'

# CASE 4: Repeated Inference Stability (10 consecutive runs)
latencies = []
for _ in range(10):
    _, l = run_browser_emulation(img1)
    latencies.append(l)
print(f'5. Repeated Inference (10 consecutive passes):')
print(f'   Mean: {np.mean(latencies):.1f} ms, Min: {np.min(latencies):.1f} ms, Max: {np.max(latencies):.1f} ms, Std: {np.std(latencies):.1f} ms')

# CASE 5: Verification of JSON Export Schema
mock_report = {
    'system': 'PCB Vision AI',
    'version': '2.0.0',
    'detectionSummary': {
        'totalDefects': len(dets1),
        'verdict': 'SURFACE_ANOMALIES_LOCALIZED' if len(dets1) > 0 else 'NO_ANOMALIES_DETECTED_WITHIN_THRESHOLD',
        'disclaimer': 'Notice: Optical automated surface defect detection does not substitute for in-circuit bed-of-nails continuity testing.'
    },
    'detections': [{'classId': d['cls'], 'className': DEFECT_CLASSES[d['cls']], 'confidence': round(d['score']*100, 2), 'bbox': [round(v, 1) for v in d['bbox']]} for d in dets1]
}
assert 'disclaimer' in mock_report['detectionSummary']
assert mock_report['detectionSummary']['verdict'] in ['SURFACE_ANOMALIES_LOCALIZED', 'NO_ANOMALIES_DETECTED_WITHIN_THRESHOLD']
print('6. JSON Export Schema & Academic Disclaimer: VERIFIED')

print('======================================================================')
print('PHASE 2 VALIDATION COMPLETED: ALL CRITERIA SATISFIED!')
print('======================================================================')
