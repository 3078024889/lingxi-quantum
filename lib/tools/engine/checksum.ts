import fs from "node:fs";import crypto from "node:crypto";
export async function sha256File(file:string){return new Promise<string>((resolve,reject)=>{const h=crypto.createHash("sha256"),s=fs.createReadStream(file);s.on("data",d=>h.update(d));s.on("error",reject);s.on("end",()=>resolve(h.digest("hex")))});}
