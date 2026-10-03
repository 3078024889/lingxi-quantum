const source=`const COPY = {
  draftReady:c("A","B"),  copyAll:c("复制全部","Copy all"),
  copied:c("已复制","Copied"),
};`;

let s=source;
for(const key of["draftReady"]){
 const rx=new RegExp(`(^|\\n)\\s*${key}:c\\([\\s\\S]*?\\),\\s*`,"m");
 s=s.replace(rx,(match,prefix)=>prefix||"");
}

if(!s.includes('copyAll:c('))throw new Error("copyAll sibling was deleted");
if(!s.includes('copied:c('))throw new Error("copied sibling was deleted");
if(s.includes('draftReady:c('))throw new Error("retired key still present");

console.log("R14_SAME_LINE_COPY_SIBLING_REGRESSION=PASS");
