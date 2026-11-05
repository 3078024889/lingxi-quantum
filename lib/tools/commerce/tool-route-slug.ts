/** Resolve the same live tool from Chinese and eight localized public routes. */
export function toolSlugFromPathname(pathname:string):string|null{
 const match=/^\/(?:((?:en|ja|ko|fr|de|es|pt|ar))\/)?tools\/([a-z0-9-]+)(?:\/|$)/.exec(pathname);
 return match?.[2]??null;
}
