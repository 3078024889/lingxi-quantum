import DeletableReportRow from "./DeletableReportRow";
export default function TarotReadingReportRow(props:{id:string;title:string|null;date:string}){return <DeletableReportRow {...props} kind="mirror" href={"/mirror/reading/full?id="+props.id}/>;}
