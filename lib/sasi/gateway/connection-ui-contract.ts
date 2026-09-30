export interface ConnectionForm{displayName:string;baseUrl:string;apiKey:string;model:string}
export const CONNECTION_UI_COPY={title:"连接我的服务",add:"添加连接",connections:"我的连接",baseUrl:"服务地址",apiKey:"密钥",model:"模型"};
export function sanitizeConnectionForClient(x:ConnectionForm){return {displayName:x.displayName,baseUrl:x.baseUrl,model:x.model}}
