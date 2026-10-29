export const CATEGORIES = Object.freeze(['design','data','localization','commerce','security','release']);
export const DECISIONS = Object.freeze(['feedback','request_changes','acknowledged']);
export function validateReviewFeedback(value){
 if (!value || typeof value!=='object' || Array.isArray(value)) return null;
 const {revision,category,decision,note}=value;
 if (typeof revision!=='string' || !/^[a-f0-9]{40}$/.test(revision)) return null;
 if (!CATEGORIES.includes(category) || !DECISIONS.includes(decision)) return null;
 if (typeof note!=='string' || note.trim().length<3 || note.trim().length>2000) return null;
 return {revision,category,decision,note:note.trim()};
}
