export declare const CATEGORIES: readonly string[];
export declare const DECISIONS: readonly string[];
export type ReviewFeedback = {revision:string;category:string;decision:string;note:string};
export declare function validateReviewFeedback(value:unknown):ReviewFeedback|null;
