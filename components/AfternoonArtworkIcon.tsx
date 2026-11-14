export type AfternoonIconKind="chart"|"tools"|"layers"|"cart"|"people"|"shield"|"seller"|"coins";

/** Decorative raster artwork. The adjacent text supplies its accessible name. */
export default function AfternoonArtworkIcon({kind,className="",testId}:{kind:AfternoonIconKind;className?:string;testId?:string}) {
 return <span aria-hidden="true" className={`lx-afternoon-art ${className}`} data-art-kind={kind} data-testid={testId}/>;
}
