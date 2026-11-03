/** Native PDF operator coordinates only match the viewer on unrotated uncropped origin-zero pages. */
import type {PDFPage} from "pdf-lib";
export function canNativeEditPage(page:PDFPage):boolean{
 const media=page.getMediaBox(),crop=page.getCropBox();
 const all=[media.x,media.y,media.width,media.height,crop.x,crop.y,crop.width,crop.height];
 if(all.some(x=>!Number.isFinite(x))||media.width<=0||media.height<=0)return false;
 const epsilon=.001;
 return page.getRotation().angle%360===0&&
  Math.abs(media.x)<=epsilon&&Math.abs(media.y)<=epsilon&&
  Math.abs(crop.x-media.x)<=epsilon&&Math.abs(crop.y-media.y)<=epsilon&&
  Math.abs(crop.width-media.width)<=epsilon&&Math.abs(crop.height-media.height)<=epsilon;
}
