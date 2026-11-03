# LINGXIFIELD AI Market V2.0 (local prototype)

## What is implemented
- Keeps V1 homepage and detail page.
- Language dropdown with all nine language options (interface extension components translated; **existing V1 body text remains Chinese** pending full localization).
- CNY/USD price selection with equal nominal amount (no FX conversion), only for platform-owned vendor services.
- Interactive 2–3-product comparison modal, existing search with evidence-aware placeholder answers.
- Domain and memory deployment notes in `DEPLOYMENT.md`.
- Live rankings, payment capture, vendor verification, actual reviews, SEO/GEO tracking and translated SEO paths are **not yet connected**. This is a local functional prototype, not production-ready.

## Commands (PowerShell)
```powershell
Set-Location 'D:\30780\lingxi-quantum\lingxifield-ai-market'
npm.cmd install
npm.cmd run build
npm.cmd run dev -- -p 3001
```
The bundle can be used as a standalone replacement only after backup. `INSTALL_V2.ps1` makes a backup and copies files into the expected formal directory, excluding user-managed dependencies.
