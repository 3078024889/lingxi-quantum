# Optional local CLIP food-vision pack

This package does **not** automatically download or ship the optional CLIP model.

Installer:
`powershell -ExecutionPolicy Bypass -File scripts/food/INSTALL_CLIP_FOOD_VISION.ps1`

Source:
`Xenova/clip-vit-base-patch32`

Purpose:
local browser zero-shot image classification, used only as a broader second signal beside Food-101.

The application disables remote model loading. If this pack is absent, the existing Food-101 model continues to work and the UI does not claim broad recognition.

Before redistributing model weights as part of a commercial binary/package, re-check the current upstream model/weight license and attribution terms. The installer intentionally records source and checksum rather than silently vendoring the model into this patch.
