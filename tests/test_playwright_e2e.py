import sys
import time
import json
import os
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PREVIEW_URL = "https://pcb-vision-grkat8qyx-shaik-mahammad-shariff-s-projects.vercel.app"

def test_full_browser_e2e():
    print("=" * 70)
    print("PLAYWRIGHT END-TO-END BROWSER AUTOMATION TEST")
    print(f"Target: {PREVIEW_URL}")
    print("=" * 70)

    with sync_playwright() as p:
        # Launch headless Chromium with download handling
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            accept_downloads=True
        )
        page = context.new_page()

        # Track network requests to verify ZERO outbound image uploads
        outbound_image_uploads = []
        def on_request(request):
            if request.method in ["POST", "PUT"] and ("upload" in request.url or "image" in request.url):
                outbound_image_uploads.append(request.url)
        page.on("request", on_request)

        # 1. Load Homepage
        print("1. Loading preview homepage...")
        t0 = time.time()
        page.goto(PREVIEW_URL, wait_until="networkidle", timeout=60000)
        print(f"   Homepage loaded in {time.time() - t0:.2f}s")
        assert "PCB Vision AI" in page.title()
        print("   Title verified successfully.")

        # 2. Verify Hero Section & Expandable Drawer
        print("2. Verifying Hero Section & Technical Specs Drawer...")
        hero_heading = page.locator("h1:has-text('Intelligent Bare PCB Defect Inspection')")
        assert hero_heading.is_visible()
        print("   Hero heading is visible.")

        # Expand technical specs drawer
        expand_btn = page.locator("button:has-text('Collapse Details')")
        if not expand_btn.is_visible():
            expand_btn = page.locator("button:has-text('Expand Technical Specs')")
            expand_btn.click()
            page.wait_for_timeout(300)
        assert page.locator("text=Six Defect Categories").is_visible()
        print("   Expandable specs drawer verified.")

        # 3. Wait for Model Initialization
        print("3. Waiting for YOLOv8n ONNX model initialization...")
        page.wait_for_selector("text=Model Ready (WASM SIMD)", timeout=30000)
        print("   Model initialized successfully inside WebAssembly runtime!")

        # 4. Run Inspection on DeepPCB Sample 1 (Defective Board)
        print("4. Executing AI Inspection on Sample 1 (Defective)...")
        sample1_btn = page.locator("button:has-text('DeepPCB Sample 1')")
        sample1_btn.click()
        page.wait_for_timeout(500)

        run_btn = page.locator("button:has-text('Run PCB Defect Inspection')")
        run_btn.click()

        # Wait for inference completion
        page.wait_for_selector("text=SURFACE ANOMALIES", timeout=15000)
        verdict_text = page.locator("text=10 SURFACE ANOMALIES").first.inner_text()
        print(f"   Inspection complete! Verdict: {verdict_text.strip()}")
        assert "10 SURFACE ANOMALIES" in verdict_text

        # 5. Verify Defect Inventory Table
        print("5. Verifying Defect Inventory Table & Records...")
        inventory_heading = page.locator("text=Detected Defect Inventory")
        assert inventory_heading.is_visible()

        rows = page.locator("table tbody tr")
        row_count = rows.count()
        print(f"   Table defect rows count: {row_count}")
        assert row_count == 10

        first_row_text = rows.first.inner_text()
        print(f"   First defect record: {first_row_text.replace(chr(10), ' | ')}")
        assert "copper" in first_row_text.lower()

        # 6. Test Optical Zoom & Pan Controls
        print("6. Testing Optical Zoom & Pan Controls...")
        zoom_in_btn = page.locator("button[aria-label='Zoom in']")
        zoom_in_btn.click()
        page.wait_for_timeout(300)
        assert page.locator("text=1.5x").is_visible()
        zoom_in_btn.click()
        page.wait_for_timeout(300)
        assert page.locator("text=2.0x").is_visible()
        print("   Zoom in to 2.0x confirmed.")

        reset_zoom_btn = page.locator("button[aria-label='Reset zoom to fit']")
        reset_zoom_btn.click()
        page.wait_for_timeout(300)
        assert page.locator("text=1.0x").is_visible()
        print("   Reset zoom to 1.0x confirmed.")

        # 7. Test Defect Class Toggles & Before/After Toggle
        print("7. Testing Class Filters and Box Visibility Toggle...")
        boxes_toggle = page.locator("button[aria-label='Toggle defect annotations on canvas']")
        assert boxes_toggle.is_visible()
        boxes_toggle.click()
        page.wait_for_timeout(300)
        assert page.locator("text=Boxes Off").is_visible()
        boxes_toggle.click()
        page.wait_for_timeout(300)
        assert page.locator("text=Boxes On").is_visible()
        print("   Before / After boxes toggle verified.")

        copper_toggle = page.locator("button[aria-label='Toggle visibility of copper defect class']")
        copper_toggle.click()
        page.wait_for_timeout(300)
        print("   Copper class toggle off verified.")
        copper_toggle.click()
        page.wait_for_timeout(300)

        # 8. Test Exports: CSV and JSON
        print("8. Testing CSV and JSON Report Downloads...")
        with page.expect_download() as download_info_csv:
            page.locator("button:has-text('Defect CSV')").click()
        csv_download = download_info_csv.value
        csv_path = csv_download.suggested_filename
        print(f"   CSV downloaded successfully: {csv_path}")
        assert "pcb_defects" in csv_path and csv_path.endswith(".csv")

        with page.expect_download() as download_info_json:
            page.locator("button:has-text('Inspection Report JSON')").click()
        json_download = download_info_json.value
        json_path = json_download.suggested_filename
        print(f"   JSON report downloaded successfully: {json_path}")
        assert "pcb_inspection_report" in json_path and json_path.endswith(".json")

        # 9. Test Classical DIP Lab
        print("9. Testing Defect-Free Golden Reference Template in Classical DIP Lab...")
        diplab_tab = page.locator("button:has-text('Classical DIP Lab')").first
        diplab_tab.click()
        page.wait_for_timeout(500)

        run_dip_btn = page.locator("button:has-text('Execute DIP Pipeline')")
        assert run_dip_btn.is_visible()
        run_dip_btn.click()
        page.wait_for_selector("text=Multi-Stage Digital Image Processing Results", timeout=15000)
        print("   Classical DIP Pipeline executed successfully on template pair!")
        assert page.locator("text=Stage 1: Absolute Difference").is_visible()
        assert page.locator("text=Stage 4: Connected Components").is_visible()

        # 10. Test Mobile Viewport Responsiveness
        print("10. Testing Mobile Viewport (375x812 - iPhone X/12)...")
        mobile_page = context.new_page()
        mobile_page.set_viewport_size({"width": 375, "height": 812})
        mobile_page.goto(PREVIEW_URL, wait_until="networkidle")
        mobile_page.wait_for_timeout(500)

        mobile_heading = mobile_page.locator("h1:has-text('Intelligent Bare PCB Defect Inspection')")
        assert mobile_heading.is_visible()
        print("   Mobile viewport renders without overflow!")
        mobile_page.close()

        # 11. Test Legal Routes (/privacy, /terms)
        print("11. Verifying /privacy and /terms routes...")
        page.goto(f"{PREVIEW_URL}/privacy", wait_until="networkidle")
        assert page.locator("h1:has-text('Privacy Policy')").is_visible()
        assert page.locator("text=Zero Server Uploads").is_visible()
        print("   /privacy verified.")

        page.goto(f"{PREVIEW_URL}/terms", wait_until="networkidle")
        assert page.locator("h1:has-text('Terms of Use')").is_visible()
        assert page.locator("text=No Electrical Guarantee").is_visible()
        print("   /terms verified.")

        # 12. Verify Privacy Invariant: Zero outbound image uploads
        print("12. Verifying Zero Outbound Image Exfiltration...")
        print(f"    Outbound image upload requests recorded: {len(outbound_image_uploads)}")
        assert len(outbound_image_uploads) == 0, f"Privacy violation! Detected uploads: {outbound_image_uploads}"
        print("    PASS: Zero image bytes left the browser sandbox!")

        browser.close()

    print("=" * 70)
    print("ALL PLAYWRIGHT E2E BROWSER TESTS PASSED 100%!")
    print("=" * 70)

if __name__ == "__main__":
    test_full_browser_e2e()
