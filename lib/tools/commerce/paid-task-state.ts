export type PaidTaskPhase=
 |"idle"|"pricing"|"quoted"|"waitingPayment"|"paid"|"generating"|"completed"|"error";

export type PaidTaskEvent=
 |{type:"PRICE"}
 |{type:"QUOTED"}
 |{type:"PAY"}
 |{type:"PAID"}
 |{type:"GENERATE"}
 |{type:"COMPLETE"}
 |{type:"FAIL"}
 |{type:"RESET"};

const ALLOWED:Record<PaidTaskPhase,Partial<Record<PaidTaskEvent["type"],PaidTaskPhase>>>={
 idle:{PRICE:"pricing",RESET:"idle"},
 pricing:{QUOTED:"quoted",FAIL:"error",RESET:"idle"},
 quoted:{PAY:"waitingPayment",PRICE:"pricing",RESET:"idle"},
 waitingPayment:{PAID:"paid",FAIL:"error",RESET:"idle"},
 paid:{GENERATE:"generating",COMPLETE:"completed",RESET:"idle"},
 generating:{COMPLETE:"completed",FAIL:"error"},
 completed:{RESET:"idle"},
 error:{PRICE:"pricing",PAY:"waitingPayment",GENERATE:"generating",RESET:"idle"},
};

export function transitionPaidTask(phase:PaidTaskPhase,event:PaidTaskEvent):PaidTaskPhase{
 const next=ALLOWED[phase][event.type];
 if(!next)throw new Error(`INVALID_PAID_TASK_TRANSITION:${phase}:${event.type}`);
 return next;
}

export function isPaidTaskTerminal(phase:PaidTaskPhase){return phase==="completed"}
export function canOpenPayment(phase:PaidTaskPhase){return phase==="quoted"}
