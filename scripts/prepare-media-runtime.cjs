const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ocrTarget=path.join(__dirname,'..','public','media','ocr-7.0.0-v1');
const ocrPackage=path.dirname(require.resolve('tesseract.js/package.json'));
const corePackage=path.dirname(require.resolve('tesseract.js-core/package.json'));
const manifest=[];
function copyAsset(source,relative){
 const destination=path.join(ocrTarget,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(source,destination);const bytes=fs.readFileSync(source);
 manifest.push({file:relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
if(JSON.parse(fs.readFileSync(path.join(ocrPackage,'package.json'))).version!=='7.0.0')throw Error('OCR_WORKER_VERSION_MISMATCH');
if(JSON.parse(fs.readFileSync(path.join(corePackage,'package.json'))).version!=='7.0.0')throw Error('OCR_CORE_VERSION_MISMATCH');
copyAsset(path.join(ocrPackage,'dist','worker.min.js'),'worker.min.js');
copyAsset(path.join(ocrPackage,'LICENSE.md'),'LICENSE-tesseract.txt');
copyAsset(path.join(corePackage,'LICENSE'),'LICENSE-core.txt');
for(const variant of ['lstm','simd-lstm','relaxedsimd-lstm']){
 for(const suffix of ['wasm.js','wasm'])copyAsset(path.join(corePackage,`tesseract-core-${variant}.${suffix}`),`core/tesseract-core-${variant}.${suffix}`);
}
for(const language of ['eng','chi_sim','chi_tra','jpn','kor','fra','deu','spa','por','ara']){
 const directory=path.dirname(require.resolve(`@tesseract.js-data/${language}/package.json`));
 copyAsset(path.join(directory,'4.0.0_best_int',`${language}.traineddata.gz`),`lang/${language}.traineddata.gz`);
 copyAsset(path.join(directory,'package.json'),`licenses/${language}-package.json`);
}
copyAsset(path.join(ocrPackage,'LICENSE.md'),'LICENSE-traineddata-Apache-2.0.txt');
fs.writeFileSync(path.join(ocrTarget,'manifest.json'),JSON.stringify({engine:'tesseract.js 7.0.0',core:'tesseract.js-core 7.0.0',languagePackages:'@tesseract.js-data/* 1.0.0',assets:manifest},null,2));
fs.writeFileSync(path.join(ocrTarget,'SOURCE.txt'),'Unmodified Tesseract.js 7.0.0 worker and Tesseract.js-core 7.0.0 LSTM browser assets, Apache-2.0. Language data from pinned @tesseract.js-data packages 1.0.0 (MIT package license; Tesseract trained data Apache-2.0). Source: https://github.com/naptha/tesseract.js ; https://github.com/naptha/tesseract.js-core ; https://github.com/naptha/tessdata ; https://github.com/tesseract-ocr/tessdata\nApplication API abort patch: patches/tesseract.js@7.0.0.patch. Only requested language data is fetched by the browser.\n');
const target = path.join(__dirname, '..', 'public', 'media', 'ffmpeg-0.12.10');
fs.mkdirSync(target, { recursive: true });
for (const [source, name] of [[require.resolve('@ffmpeg/core'), 'ffmpeg-core.js'], [require.resolve('@ffmpeg/core/wasm'), 'ffmpeg-core.wasm']]) {
  fs.copyFileSync(source, path.join(target, name));
}
fs.writeFileSync(path.join(target, 'SOURCE.txt'), 'FFmpeg.wasm core 0.12.10, GPL-2.0-or-later. Unmodified npm distribution.\nSource and build scripts: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/v0.12.10\nFFmpeg source: https://github.com/ffmpegwasm/ffmpeg.wasm-core\nLicense: https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt\n');
