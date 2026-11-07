import{test,expect}from"./export-test";

const mutationHeaders={origin:"https://lingxifield.cn",host:"lingxifield.cn","sec-fetch-site":"same-origin"};

test("document ticket rejects unsupported files",async({request})=>{
 const r=await request.post("/api/tools/document/ticket",{headers:mutationHeaders,data:{name:"payload.exe",size:100,type:"application/octet-stream"}});
 expect(r.status()).toBe(415);
});

test("document ticket rejects files over 50 MB",async({request})=>{
 const r=await request.post("/api/tools/document/ticket",{headers:mutationHeaders,data:{name:"big.docx",size:50*1024*1024+1,type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}});
 expect(r.status()).toBe(413);
});

test("document ticket accepts supported office input",async({request})=>{
 const r=await request.post("/api/tools/document/ticket",{headers:mutationHeaders,data:{name:"sample.docx",size:1024,type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}});
 expect(r.ok()).toBeTruthy();
 const j=await r.json();
 expect(["direct","same-origin"]).toContain(j.mode);
 expect(j.maxBytes).toBeGreaterThan(0);
});
