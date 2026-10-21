# Vercel Deployment Pipeline Audit & Root Cause Analysis

**Project:** PCB Vision AI  
**GitHub Repository:** `https://github.com/skmdshariff143-ai/PCB-Vision-AI`  
**Production URL:** `https://pcb-vision-ai-ten.vercel.app`  
**Preview Deployment URL:** `https://pcb-vision-ctanf1oeg-shaik-mahammad-shariff-s-projects.vercel.app`  
**Commit SHA:** `d682a47425b6e9411198c35646433613ae2d396f`  
**Resolution Date:** October 21, 2026  

---

## 1. Incident Analysis: Failed Git-Triggered Deployment `dpl_9k2qggRrRwx2EizgeUbYngmMyWic`

### Symptoms:
- **Error Code:** `missing_pages_app`
- **Build Command:** Standard Next.js auto-detected runner
- **Exit Code:** `1`
- **Build Duration:** 5 seconds

### Root Cause:
The repository houses both the Python computer vision research workspace (in `src/`, `tests/`, `dataset/`) and the Next.js 14 web application (in `web/`). 
When Vercel's GitHub app was first connected to `https://github.com/skmdshariff143-ai/PCB-Vision-AI`, the project settings on Vercel defaulted the **Root Directory** to `.` (the repository root). 

Upon receiving the Git push webhook for commit `d682a47`, Vercel attempted to locate the Next.js App Router (`app/`) or Pages Router (`pages/`) at the repository root. Because those directories reside inside `web/app/`, the build runner immediately threw:
```text
Error: No Next.js version could be detected in your project.
errorCode: "missing_pages_app"
```

---

## 2. Corrective Engineering Actions Taken

1. **Project Settings Inspection:**
   Inspected project `prj_ElgMVFbj4rOEwp1IbHMgnSzkXnIZ` using Vercel CLI. Confirmed that `Root Directory` was set to `.`.
2. **Root Directory Correction:**
   Executed project update to configure the proper monorepo subfolder:
   ```bash
   vercel project update pcb-vision-ai --root-directory web --framework nextjs --yes
   ```
   **Confirmed New Settings:**
   - `Root Directory`: `web`
   - `Framework Preset`: `nextjs`
   - `Build Command`: Standard Next.js `npm run build`
   - `Output Directory`: Next.js default (`.next`)
   - `Install Command`: `npm install`
   - `Node.js Version`: `24.x`
3. **Fresh Preview Deployment Created:**
   Redeployed commit `d682a47` with `--target preview`:
   ```bash
   vercel redeploy dpl_9k2qggRrRwx2EizgeUbYngmMyWic --target preview
   ```
   - **Deployment ID:** `dpl_CG7xcL5bJ6YDBo5rJYyHdpyTtYLa`
   - **Preview URL:** `https://pcb-vision-ctanf1oeg-shaik-mahammad-shariff-s-projects.vercel.app`
   - **Build Outcome:** `✓ Ready in 1m` (Exit Code 0).

---

## 3. End-to-End Verification Matrix (Preview Deployment)

| Test Item | Endpoint | Verification Result |
|---|---|---|
| **Preview Homepage** | `https://pcb-vision-ctanf1oeg-shaik-mahammad-shariff-s-projects.vercel.app` | **HTTP 200 OK** (22,753 bytes) |
| **ONNX Model Asset** | `.../models/pcb_yolov8n.onnx` | **HTTP 200 OK** (12,778,103 bytes) |
| **Sample Test PCB #1** | `.../samples/pcb_sample_1_test.jpg` | **HTTP 200 OK** (17,020 bytes) |
| **Sample Template PCB #1** | `.../samples/pcb_sample_1_temp.jpg` | **HTTP 200 OK** (22,557 bytes) |
| **Client-Side WASM Inference** | Live model execution on test sample | **PASS** (96 candidates, up to 86.2% confidence) |
| **DIP Canvas Filters** | Luma conversion, Gaussian, Otsu, Morphology | **PASS** (Client-side interactive execution) |

---

## 4. Automatic GitHub CI/CD Pipeline Health

With `rootDirectory: "web"` active in the Vercel project configuration:
- Every future commit pushed to GitHub `main` will automatically build and deploy to production (`https://pcb-vision-ai-ten.vercel.app`).
- Every pull request or push to `dev` will automatically generate an isolated preview URL.
- Zero manual CLI builds are required going forward.
