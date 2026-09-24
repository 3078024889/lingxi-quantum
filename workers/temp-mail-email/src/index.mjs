import PostalMime from "postal-mime";

export default {
  async email(message,env){
    const parsed=await PostalMime.parse(message.raw);
    const text=(parsed.text||String(parsed.html||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).slice(0,200000);
    const response=await fetch(env.INGEST_URL,{
      method:"POST",
      headers:{"content-type":"application/json","x-temp-mail-ingest-secret":env.INGEST_SECRET},
      body:JSON.stringify({
        to:message.to,
        from:parsed.from?.address||message.from,
        subject:parsed.subject||"(无主题)",
        text,
        sizeBytes:Number(message.rawSize||0),
      }),
    });
    if(!response.ok)throw new Error(`LINGXIFIELD_INGEST_${response.status}`);
  }
};
