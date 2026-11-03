import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const src=readFileSync(new URL("../../components/tools/PdfEditorWorkbench.tsx",import.meta.url),"utf8");
test("PDF original text hitboxes sit below interactive annotations",()=>{
 const nativeAt=src.indexOf('data-testid="pdf-source-text-region"');
 assert(nativeAt>0);
 const native=src.slice(nativeAt,nativeAt+700);
 assert.match(native,/className="absolute z-\[1\] cursor-text/);
 const at=src.indexOf('data-testid="pdf-overlay"');
 assert(at>0);
 const annotation=src.slice(at,at+1600);
 assert.match(annotation,/absolute z-\[2\] select-none/);
 assert.match(annotation,/scrollMarginTop:"160px"/);
});
