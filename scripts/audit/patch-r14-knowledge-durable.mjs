import fs from"node:fs";
const file="components/KnowledgeWorkspace.tsx";
let src=fs.readFileSync(file,"utf8");

if(src.includes('useState(false);')&&src.includes('acceptConnectedBilling:useConnectedService')&&src.includes('"Idempotency-Key":pendingTurn.id')){
 console.log("R14_KNOWLEDGE_UI_ALREADY_CURRENT=PASS");process.exit(0);
}

const oldState='const [question,setQuestion]=useState("");const [useConnectedService,setUseConnectedService]=useState(true);';
const newState='const [question,setQuestion]=useState("");const [useConnectedService,setUseConnectedService]=useState(false);';
if(src.includes(oldState))src=src.replace(oldState,newState);
else if(!src.includes('const [useConnectedService,setUseConnectedService]=useState(false);'))throw new Error("R14_CONNECTED_DEFAULT_SHAPE_DRIFT");

const fetchRe=/fetch\("\/api\/knowledge\/ask",\{method:"POST",headers:\{"Content-Type":"application\/json"\},body:JSON\.stringify\(\{/;
if(fetchRe.test(src)){
 src=src.replace(fetchRe,'fetch("/api/knowledge/ask",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":pendingTurn.id},body:JSON.stringify({clientTurnId:pendingTurn.id,acceptConnectedBilling:useConnectedService,');
}else if(!src.includes('"Idempotency-Key":pendingTurn.id')){
 throw new Error("R14_KNOWLEDGE_FETCH_SHAPE_DRIFT");
}

fs.writeFileSync(file,src,"utf8");
console.log("R14_KNOWLEDGE_EXPLICIT_BILLING_UI=PASS");
console.log("R14_KNOWLEDGE_IDEMPOTENCY_HEADER=PASS");
