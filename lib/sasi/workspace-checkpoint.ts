/** Keep durable plans in their owned production, not duplicated in chat JSON. */
export function workspaceCheckpoint(workspace:Record<string,any>):Record<string,any>{
 const drama=workspace.creation?.drama;
 if(!drama||typeof drama!=='object'||Array.isArray(drama)||typeof drama.productionId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(drama.productionId))return {...workspace};
 return {...workspace,creation:{...workspace.creation,drama:{...drama,preparedShots:[]}}};
}
