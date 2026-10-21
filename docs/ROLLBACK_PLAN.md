# PCB Vision AI — Emergency Rollback & Recovery Plan

**Target Production:** `https://pcb-vision-ai-ten.vercel.app`  
**Current Known Good Deployment:** `dpl_25nD1K8cxJXnNQE36NBj1sYDi4tA` (Commit: `cacf168`)  
**New Candidate Deployment:** `dpl_ApjvjZ1cZrNMir15AEWTJRBn8VhY` (Commit: `4e3877c`)

---

## 1. Rollback Trigger Criteria

An immediate rollback MUST be triggered if any of the following occur following production promotion:
1. The production URL `https://pcb-vision-ai-ten.vercel.app` returns HTTP 5xx or fails to serve the Next.js application shell.
2. The ONNX model asset `/models/pcb_yolov8n.onnx` fails to download or load into WebAssembly memory.
3. Canvas rendering fails to execute on standard consumer browsers.
4. Any regression occurs that compromises the zero-upload privacy invariant.

---

## 2. Step-by-Step Instant Rollback Procedure

### Step 1: Re-Promote Previous Verified Stable Deployment (Zero Downtime)
Execute immediately from the local terminal:
```bash
npx vercel promote dpl_25nD1K8cxJXnNQE36NBj1sYDi4tA --yes
```
*Expected Outcome:* Within 5–10 seconds, Vercel Edge re-assigns the production alias `https://pcb-vision-ai-ten.vercel.app` back to deployment `dpl_25nD1K8cxJXnNQE36NBj1sYDi4tA`.

### Step 2: Verify Production Alias Reversion
Run an inspection probe to confirm the alias:
```bash
npx vercel inspect pcb-vision-ai-ten.vercel.app
```
Confirm the output displays `id: dpl_25nD1K8cxJXnNQE36NBj1sYDi4tA`.

### Step 3: Git Branch Recovery (If `main` was updated)
If `main` was already fast-forwarded on GitHub, revert or reset the branch:
```bash
git checkout main
git reset --hard cacf168ca25e3cdd3c11c36bdc4051fab6059d66
git push origin main --force
```

---

## 3. Post-Rollback Diagnostics
- Inspect runtime logs via `npx vercel logs dpl_ApjvjZ1cZrNMir15AEWTJRBn8VhY`.
- Reproduce the exact issue in a local testing sandbox before attempting any subsequent release.
