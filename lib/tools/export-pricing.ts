export function pdfExportPrice(pages:number){
  if(pages<=5)return 1.9;
  if(pages<=20)return 2.9;
  if(pages<=50)return 4.9;
  if(pages<=100)return 7.9;
  if(pages<=200)return 12.9;
  return Number((12.9 + Math.ceil((pages-200)/50)*3).toFixed(1));
}
