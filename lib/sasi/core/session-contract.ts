import{deriveExecutionPhase,type SasiExecutionPhase}from"./execution-lifecycle";
export type{SasiExecutionPhase}from"./execution-lifecycle";
export type SasiMode="drama"|"website"|"book"|"learning"|"research";

export type SasiConversationTurn={
 id:string;
 user:string;
 assistant:string;
 createdAt:string;
};

export type SasiResult=
 |{kind:"text";text:string}
 |{kind:"video";url:string}
 |{kind:"website";html:string}
 |{kind:"none"};

export type SasiExecutionSnapshot={
 phase:SasiExecutionPhase;
 busy:boolean;
 message?:string;
 quoteReady?:boolean;
 result:SasiResult;
};

export const createSasiTurn=(user:string,assistant:string):SasiConversationTurn=>({
 id:typeof crypto!=="undefined"&&"randomUUID"in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`,
 user,
 assistant,
 createdAt:new Date().toISOString(),
});

export function resultFromValues(input:{text?:string;videoUrl?:string;websiteHtml?:string}):SasiResult{
 if(input.videoUrl)return{kind:"video",url:input.videoUrl};
 if(input.websiteHtml)return{kind:"website",html:input.websiteHtml};
 if(input.text)return{kind:"text",text:input.text};
 return{kind:"none"};
}

export const deriveSasiPhase=deriveExecutionPhase;
