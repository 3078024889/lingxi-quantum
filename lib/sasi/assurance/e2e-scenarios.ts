export interface E2EScenario{name:string;route:string;actions:string[];assertions:string[];destructive?:boolean}
export const CORE_E2E_SCENARIOS:E2EScenario[]=[
{name:"home",route:"/",actions:["open"],assertions:["page-visible","no-fatal-error"]},
{name:"tools",route:"/tools",actions:["open"],assertions:["page-visible","tool-entry-visible"]},
{name:"sasi",route:"/sasi",actions:["open"],assertions:["page-visible","input-visible"]},
{name:"account",route:"/account",actions:["open"],assertions:["auth-boundary-visible"]},
];