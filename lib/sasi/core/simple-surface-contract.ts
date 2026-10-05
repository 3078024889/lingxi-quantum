export const SASI_SIMPLE_SURFACE={
 principle:"one-conversation-one-composer",
 primaryPrompt:"你想做什么？",
 composerActions:["attach","library","research","web","create-image"],
 hiddenFromPrimary:["provider","api","model-id","run-id","queue","lease","workflow-version"],
 progressPresentation:"human-readable-status",
 technicalStatePresentation:"progressive-disclosure",
}as const;
