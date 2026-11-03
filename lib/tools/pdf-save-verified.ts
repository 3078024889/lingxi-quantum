import type {PDFDocument} from "pdf-lib";

/**
 * Never deliver a PDF that a second parser cannot reopen with the expected pages.
 * pdf-lib may save otherwise legal objects in a cross-reader-incompatible object stream.
 * Retry once without object streams; fail closed if neither binary validates.
 *
 * Inspired by the MIT-licensed Folio saveVerified concept:
 * https://github.com/owenpkent/folio/blob/main/src/core/pdf/saveVerified.ts
 * © 2026 Folio contributors. Reimplemented for LINGXIFIELD using an injected verifier.
 */
export async function savePdfWithReopenCheck(
 doc:PDFDocument,
 expectedPages:number,
 verifyPageCount:(bytes:Uint8Array)=>Promise<number>,
):Promise<Uint8Array>{
 if(!Number.isSafeInteger(expectedPages)||expectedPages<1)throw Error("PDF_EXPECTED_PAGES_INVALID");
 let error="PDF_OUTPUT_VERIFICATION_FAILED";
 for(const useObjectStreams of [true,false]){
  try{
   const bytes=new Uint8Array(await doc.save({addDefaultPage:false,useObjectStreams}));
   if(bytes.byteLength<20)throw Error("PDF_OUTPUT_EMPTY");
   const actual=await verifyPageCount(bytes);
   if(actual===expectedPages)return bytes;
   error="PDF_PAGE_COUNT_MISMATCH";
  }catch{
   if(error!=="PDF_PAGE_COUNT_MISMATCH")error="PDF_OUTPUT_REOPEN_FAILED";
  }
 }
 throw Error(error);
}
