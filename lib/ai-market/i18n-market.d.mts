export declare const MARKET_LOCALES:readonly string[];
export declare const MARKET_DEFAULT_LOCALE:string;
export declare const MARKET_LABELS:Record<string,{search:string;placeholder:string;free:string;price:string;limits:string;use:string;unknown:string;sponsored:string;source:string;region:string;results:string;empty:string}>;
export declare function marketLocale(input:string):string;
export declare function marketDirection(input:string):'rtl'|'ltr';
export declare function marketMessage(input:string,key:string):string|null;
export declare function marketPath(locale:string,pathname?:string):string;
export declare function marketAlternates(pathname?:string):Record<string,string>;
export declare function safeMarketSnippet(input:unknown,locale:string,max?:number):string;
