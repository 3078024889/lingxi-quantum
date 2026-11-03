/** A paid status is not a delivery authorization without an exact quote binding.
 * Keep support for old page-based PDF quotes and old quote metadata contracts. */
export type ExportQuoteBinding={
 id?:unknown;tool_id?:unknown;toolId?:unknown;quantity?:unknown;unit_name?:unknown;unitName?:unknown;
 metadata?:Record<string,unknown>|null
};
export function matchesPaidExportQuote(
 quote:ExportQuoteBinding|null|undefined,
 input:{quoteId:string;toolId:string;quantity:number;draftId?:string;pages?:unknown}
):boolean{
 if(!quote||typeof quote!=='object')return false;
 if(quote.id!=null&&quote.id!==input.quoteId)return false;
 if((quote.tool_id??quote.toolId)!==input.toolId)return false;
 const quoted=Number(quote.quantity);
 if(!Number.isSafeInteger(quoted)||quoted<=0||!Number.isSafeInteger(input.quantity)||input.quantity<=0)return false;
 const pages=Number(input.pages);
 const legacyPdf=['pdf-editor','e-sign-pdf'].includes(input.toolId)&&
  (quote.unit_name??quote.unitName)==='page'&&
  Number.isSafeInteger(pages)&&pages>0&&quoted===pages;
 if(quoted!==input.quantity&&!legacyPdf)return false;
 if(quote.metadata?.draftId!=null&&quote.metadata.draftId!==input.draftId)return false;
 return true;
}
