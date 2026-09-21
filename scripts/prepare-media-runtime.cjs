const fs = require('node:fs');
const path = require('node:path');
const target = path.join(__dirname, '..', 'public', 'media', 'ffmpeg-0.12.10');
fs.mkdirSync(target, { recursive: true });
for (const [source, name] of [[require.resolve('@ffmpeg/core'), 'ffmpeg-core.js'], [require.resolve('@ffmpeg/core/wasm'), 'ffmpeg-core.wasm']]) {
  fs.copyFileSync(source, path.join(target, name));
}
fs.writeFileSync(path.join(target, 'SOURCE.txt'), 'FFmpeg.wasm core 0.12.10, GPL-2.0-or-later. Unmodified npm distribution.\nSource and build scripts: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v0.12.10\nFFmpeg source: https://github.com/ffmpegwasm/ffmpeg.wasm-core\nLicense: https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt\n');
