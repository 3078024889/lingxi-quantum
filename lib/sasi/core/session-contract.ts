export type SasiMode="drama"|"website"|"book"|"learning"|"research";
export type SasiExecutionPhase="idle"|"preparing"|"quoted"|"running"|"succeeded"|"failed"|"uncertain";

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

export function deriveSasiPhase(input:{busy:boolean;quoteReady?:boolean;hasResult?:boolean;uncertain?:boolean;failed?:boolean}):SasiExecutionPhase{
 if(input.uncertain)return"uncertain";
 if(input.failed)return"failed";
 if(input.busy)return"running";
 if(input.quoteReady)return"quoted";
 if(input.hasResult)return"succeeded";
 return"idle";
}
