import {PDFDocument,degrees,type PDFPage,type PDFEmbeddedPage} from "pdf-lib";

/** A4 landscape in PDF points, preserving the source PDF's vector content. */
const PAGE_WIDTH=841.89;
const PAGE_HEIGHT=595.28;
export type PagesPerSheet=2|4|6|9;
export type NupResult={bytes:Uint8Array;sourcePages:number;sheets:number};

function placement(page:PDFPage,embedded:PDFEmbeddedPage,index:number,perSheet:PagesPerSheet){
 const cols=perSheet===2?2:perSheet===6||perSheet===9?3:2;
 const rows=Math.ceil(perSheet/cols);
 const cellW=PAGE_WIDTH/cols,cellH=PAGE_HEIGHT/rows;
 const rotation=((page.getRotation().angle%360)+360)%360;
 if(![0,90,180,270].includes(rotation))throw new Error("PDF_PAGE_ROTATION_UNSUPPORTED");
 const visibleW=rotation%180?embedded.height:embedded.width;
 const visibleH=rotation%180?embedded.width:embedded.height;
 if(!(visibleW>0&&visibleH>0))throw new Error("PDF_PAGE_SIZE_INVALID");
 const factor=Math.min((cellW-14)/visibleW,(cellH-14)/visibleH);
 const w=embedded.width*factor,h=embedded.height*factor;
 const col=index%cols,row=Math.floor(index/cols);
 const cx=(col+.5)*cellW,cy=PAGE_HEIGHT-(row+.5)*cellH;
 // PDF drawPage rotates anticlockwise while /Rotate is specified clockwise.
 // Account for the rotated page rectangle around its origin.
 const points=rotation===90?{x:cx-h/2,y:cy+w/2}
  :rotation===180?{x:cx+w/2,y:cy+h/2}
  :rotation===270?{x:cx+h/2,y:cy-w/2}
  :{x:cx-w/2,y:cy-h/2};
 return {...points,width:w,height:h,rotate:degrees(-rotation)};
}

/** Impose 2/4/6/9 pages on each sheet without flattening text into JPG pixels.
 *  Existing interactive annotations/form widgets are not re-rendered by embedPages.
 */
export async function makePdfNupVector(input:ArrayBuffer|Uint8Array,perSheet:PagesPerSheet):Promise<NupResult>{
 if(![2,4,6,9].includes(perSheet))throw new Error("PDF_NUP_INVALID_LAYOUT");
 const source=await PDFDocument.load(input,{updateMetadata:false});
 const sourcePages=source.getPages();
 if(!sourcePages.length)throw new Error("PDF_HAS_NO_PAGES");
 const output=await PDFDocument.create();
 for(let start=0;start<sourcePages.length;start+=perSheet){
  const items=sourcePages.slice(start,start+perSheet);
  // Use the visible CropBox rather than MediaBox so trimming is retained.
  const bounds=items.map(p=>{const b=p.getCropBox();return{left:b.x,bottom:b.y,right:b.x+b.width,top:b.y+b.height}});
  const embedded=await output.embedPages(items,bounds);
  const paper=output.addPage([PAGE_WIDTH,PAGE_HEIGHT]);
  embedded.forEach((item,i)=>paper.drawPage(item,placement(items[i],item,i,perSheet)));
 }
 const bytes=await output.save({useObjectStreams:false});
 const reopened=await PDFDocument.load(bytes,{updateMetadata:false});
 if(reopened.getPageCount()!==Math.ceil(sourcePages.length/perSheet))throw new Error("PDF_NUP_VERIFICATION_FAILED");
 return {bytes,sourcePages:sourcePages.length,sheets:reopened.getPageCount()};
}
