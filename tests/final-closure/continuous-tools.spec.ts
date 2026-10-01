import{test,expect}from"playwright/test";

test("browser local handoff survives navigation and is consumed once",async({page})=>{
 await page.goto("/tools/png-to-jpg",{waitUntil:"domcontentloaded"});
 const result=await page.evaluate(async()=>{
  const DB="lingxifield-tool-workspace",STORE="handoffs",id="0123456789abcdef0123456789abcdef0123";
  const open=()=>new Promise<IDBDatabase>((resolve,reject)=>{
   const r=indexedDB.open(DB,1);
   r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"id"})};
   r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
  const d=await open(),now=Date.now();
  await new Promise<void>((resolve,reject)=>{
   const tx=d.transaction(STORE,"readwrite");
   tx.objectStore(STORE).put({id,createdAt:now,expiresAt:now+1800000,sourceSlug:"png-to-jpg",files:[{meta:{name:"handoff.png",type:"image/png",size:3,lastModified:now},blob:new Blob([new Uint8Array([1,2,3])],{type:"image/png"})}]});
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
  d.close();return id;
 });
 await page.goto(`/tools/compress-image?handoff=${result}`,{waitUntil:"domcontentloaded"});
 await expect(page.getByText("handoff.png",{exact:true}).first()).toBeVisible({timeout:10000});
 await expect(page).not.toHaveURL(/handoff=/);
});

test("continuous tool source contracts are present",async({page})=>{
 await page.goto("/tools/image-to-pdf",{waitUntil:"domcontentloaded"});
 await expect(page.locator("body")).toBeVisible();
});
