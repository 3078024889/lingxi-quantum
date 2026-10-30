// Public intake validation. This is NOT ownership verification or permission to publish.
const one=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max?v.trim():'';
const https=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.searchParams.has('token')&&u.hostname.includes('.')?u.href:''}catch{return ''}};
const email=v=>typeof v==='string'&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)?v.trim().toLowerCase():'';
export function validateVendorSubmission(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const type=one(input.requestType,20);
 if(!['claim','update','list'].includes(type))return null;
 const productName=one(input.productName,160),site=https(input.officialSite);
 const workEmail=email(input.workEmail),submitterName=one(input.submitterName,120),evidenceUrl=https(input.evidenceUrl);
 if(!productName||!site||!workEmail||!submitterName||!evidenceUrl)return null;
 const projectId=one(input.projectId,120)||'new:'+productName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g,'-');
 const description=typeof input.description==='string'?input.description.trim().slice(0,1200):'';
 const allowedLinks={x:'xUrl',windows:'windowsUrl',mac:'macUrl',ios:'iosUrl',android:'androidUrl',team:'teamUrl',funding:'fundingUrl'};
 const proposedData={};for(const [name,key] of Object.entries(allowedLinks)){
  if(input[key]!==undefined&&input[key]!==''&&input[key]!==null){
   const link=https(input[key]);if(!link)return null;proposedData[name]=link;
  }
 }
 const domain=new URL(site).hostname.toLowerCase().replace(/^www\./,'');
 const mailDomain=workEmail.split('@')[1];
 return {request_type:type,project_id:projectId,product_name:productName,official_site:site,work_email:workEmail,
  submitter_name:submitterName,description,proposed_data:proposedData,evidence_url:evidenceUrl,
  domainMatches:mailDomain===domain||mailDomain.endsWith('.'+domain),
  status:'pending_identity_check',verified_domain:false};
}
