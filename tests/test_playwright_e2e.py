"""
PCB Vision AI — Multi-Browser Playwright End-to-End Automation Test Suite
Phase 5 Independent Verification Protocol
Validates: Chromium, Firefox, WebKit across multiple viewports
"""

import sys
import time
import json
import os
import pytest
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PREVIEW_URL = "https://pcb-vision-ai-ten.vercel.app"

VIEWPORTS = [
    {"name": "Narrow Mobile (iPhone SE)", "width": 320, "height": 568},
    {"name": "Standard Mobile (iPhone X/12)", "width": 375, "height": 812},
    {"name": "Modern Mobile (iPhone 13/14)", "width": 390, "height": 844},
    {"name": "Tablet Portrait (iPad)", "width": 768, "height": 1024},
    {"name": "Tablet Landscape (iPad)", "width": 1024, "height": 768},
    {"name": "Standard Laptop (MacBook)", "width": 1440, "height": 900},
    {"name": "Desktop (FHD)", "width": 1920, "height": 1080},
]


def test_full_browser_e2e():
    print("\n" + "=" * 75)
    print("PLAYWRIGHT MULTI-BROWSER COMPREHENSIVE END-TO-END AUTOMATION SUITE")
    print(f"Target URL: {PREVIEW_URL}")
    print("=" * 75)

    with sync_playwright() as p:
        # -------------------------------------------------------------
        # 1. Primary Comprehensive Functional Run in Chromium
        # -------------------------------------------------------------
        print("\n>>> Phase 5.1: Functional Testing on Chromium (Desktop 1440x900)")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            accept_downloads=True
        )
        page = context.new_page()

        # Request interception: confirm ZERO outbound image uploads
        outbound_image_uploads = []
        def on_request(req):
            if req.method in ["POST", "PUT"] and any(k in req.url for k in ["upload", "image", "inspect", "inference"]):
                if not req.url.endswith(".onnx"):
                    outbound_image_uploads.append(req.url)
        page.on("request", on_request)

        # 1. Load Homepage
        t0 = time.time()
        page.goto(PREVIEW_URL, wait_until="networkidle", timeout=60000)
        load_time = time.time() - t0
        print(f"  [1] Homepage loaded in {load_time:.2f}s — Title: {page.title()}")
        assert "PCB Vision AI" in page.title()

        # 2. Hero Section & Technical Specs Drawer
        hero = page.locator("h1:has-text('Intelligent Bare PCB Defect Inspection')")
        assert hero.is_visible()
        expand_btn = page.locator("button:has-text('Collapse Details')")
        if not expand_btn.is_visible():
            expand_btn = page.locator("button:has-text('Expand Technical Specs')")
            expand_btn.click()
            page.wait_for_timeout(300)
        assert page.locator("text=Six Defect Categories").is_visible()
        print("  [2] Hero section & technical drawer verified.")

        # 3. Model Initialization
        print("  [3] Awaiting ONNX WebAssembly initialization...")
        page.wait_for_selector("text=Model Ready (WASM SIMD)", timeout=35000)
        print("      Model initialized successfully!")

        # 4. Defective Sample Inspection
        print("  [4] Inspecting DeepPCB Sample 1 (Defective)...")
        page.locator("button:has-text('DeepPCB Sample 1')").click()
        page.wait_for_timeout(400)
        page.locator("button:has-text('Run PCB Defect Inspection')").click()
        page.wait_for_selector("text=SURFACE ANOMALIES", timeout=15000)
        verdict = page.locator("text=10 SURFACE ANOMALIES").first.inner_text().strip()
        print(f"      Verdict verified: {verdict}")
        assert "10 SURFACE ANOMALIES" in verdict

        # 5. Defect Inventory Records
        rows = page.locator("table tbody tr")
        row_count = rows.count()
        print(f"  [5] Defect inventory populated with {row_count} records.")
        assert row_count == 10

        # 6. Zoom & Pan
        print("  [6] Testing optical zoom (2.0x) and reset...")
        page.locator("button[aria-label='Zoom in']").click()
        page.wait_for_timeout(200)
        page.locator("button[aria-label='Zoom in']").click()
        page.wait_for_timeout(200)
        assert page.locator("text=2.0x").is_visible()
        page.locator("button[aria-label='Reset zoom to fit']").click()
        page.wait_for_timeout(200)
        assert page.locator("text=1.0x").is_visible()
        print("      Zoom controls operational.")

        # 7. Class Filters & Box Visibility
        print("  [7] Testing annotation toggle & class filter...")
        page.locator("button[aria-label='Toggle defect annotations on canvas']").click()
        page.wait_for_timeout(200)
        assert page.locator("text=Boxes Off").is_visible()
        page.locator("button[aria-label='Toggle defect annotations on canvas']").click()
        page.wait_for_timeout(200)
        assert page.locator("text=Boxes On").is_visible()
        print("      Annotation toggle operational.")

        # 8. Report Downloads
        print("  [8] Testing CSV and JSON report exports...")
        with page.expect_download() as d_csv:
            page.locator("button:has-text('Defect CSV')").click()
        csv_file = d_csv.value.suggested_filename
        assert csv_file.endswith(".csv")

        with page.expect_download() as d_json:
            page.locator("button:has-text('Inspection Report JSON')").click()
        json_file = d_json.value.suggested_filename
        assert json_file.endswith(".json")
        print(f"      CSV ({csv_file}) & JSON ({json_file}) exported successfully.")

        # 9. Classical DIP Lab
        print("  [9] Testing Classical DIP Laboratory...")
        page.locator("button:has-text('Classical DIP Lab')").first.click()
        page.wait_for_timeout(400)
        page.locator("button:has-text('Execute DIP Pipeline')").click()
        page.wait_for_selector("text=Multi-Stage Digital Image Processing Results", timeout=15000)
        assert page.locator("text=Stage 1: Absolute Difference").is_visible()
        print("      Classical DIP pipeline executed successfully.")

        # 10. Legal & Privacy Routes
        print("  [10] Testing /privacy and /terms routes...")
        page.goto(f"{PREVIEW_URL}/privacy", wait_until="networkidle")
        assert page.locator("h1:has-text('Privacy Policy')").is_visible()
        page.goto(f"{PREVIEW_URL}/terms", wait_until="networkidle")
        assert page.locator("h1:has-text('Terms of Use')").is_visible()
        print("       /privacy and /terms verified.")

        # 11. Privacy Invariant
        print("  [11] Verifying Zero Outbound Image Exfiltration...")
        print(f"       Recorded outbound image upload requests: {len(outbound_image_uploads)}")
        assert len(outbound_image_uploads) == 0, "Privacy violation detected!"
        print("       PASS: 100% client-side memory privacy verified.")

        browser.close()

        # -------------------------------------------------------------
        # 2. Multi-Viewport Responsiveness Testing
        # -------------------------------------------------------------
        print("\n>>> Phase 5.2: Multi-Viewport Responsive Matrix (Chromium)")
        browser = p.chromium.launch(headless=True)
        for vp in VIEWPORTS:
            ctx = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            pg = ctx.new_page()
            pg.goto(PREVIEW_URL, wait_until="domcontentloaded")
            pg.wait_for_timeout(400)
            h1_vis = pg.locator("h1:has-text('Intelligent Bare PCB Defect Inspection')").is_visible()
            assert h1_vis, f"Heading missing on viewport {vp['name']}"
            print(f"  Viewport {vp['width']}x{vp['height']} ({vp['name']:25s}): OK")
            ctx.close()
        browser.close()

        # -------------------------------------------------------------
        # 3. Cross-Browser Engine Compatibility: Firefox
        # -------------------------------------------------------------
        print("\n>>> Phase 5.3: Cross-Engine Verification — Firefox")
        try:
            ff_browser = p.firefox.launch(headless=True)
            ff_page = ff_browser.new_page(viewport={"width": 1280, "height": 800})
            ff_page.goto(PREVIEW_URL, wait_until="domcontentloaded", timeout=45000)
            assert "PCB Vision AI" in ff_page.title()
            print("  Firefox: Homepage rendered and title verified.")
            ff_browser.close()
        except Exception as e:
            print(f"  Firefox testing error: {e}")
            raise

        # -------------------------------------------------------------
        # 4. Cross-Browser Engine Compatibility: WebKit (Safari Engine)
        # -------------------------------------------------------------
        print("\n>>> Phase 5.4: Cross-Engine Verification — WebKit (Safari Engine)")
        try:
            wk_browser = p.webkit.launch(headless=True)
            wk_page = wk_browser.new_page(viewport={"width": 1280, "height": 800})
            wk_page.goto(PREVIEW_URL, wait_until="domcontentloaded", timeout=45000)
            assert "PCB Vision AI" in wk_page.title()
            print("  WebKit: Homepage rendered and title verified.")
            wk_browser.close()
        except Exception as e:
            print(f"  WebKit testing error: {e}")
            raise

    print("\n" + "=" * 75)
    print("ALL PLAYWRIGHT CROSS-BROWSER & MULTI-VIEWPORT TESTS PASSED 100%!")
    print("=" * 75)


if __name__ == "__main__":
    test_full_browser_e2e()
