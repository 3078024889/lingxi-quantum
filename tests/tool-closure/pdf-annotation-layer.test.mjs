import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const src=readFileSync(new URL("../../components/tools/PdfEditorWorkbench.tsx",import.meta.url),"utf8");
test("PDF hit order: image source < native text OCR < draggable annotation",()=>{
 const nativeAt=src.indexOf('data-testid="pdf-source-text-region"');
 assert(nativeAt>0);
 const native=src.slice(nativeAt,nativeAt+700);
 assert.match(native,/className="absolute z-\[3\] cursor-text/);
 const imageAt=src.indexOf('data-testid="pdf-source-image-region"');
 assert(imageAt>0);
 const image=src.slice(imageAt,imageAt+600);
 assert.match(image,/className="absolute z-\[1\] cursor-pointer/);
 const at=src.indexOf('data-testid="pdf-overlay"');
 assert(at>0);
 const annotation=src.slice(at,at+4000);
 assert.match(annotation,/absolute z-\[4\] select-none/);
 assert.match(annotation,/scrollMarginTop:"160px"/);
});
