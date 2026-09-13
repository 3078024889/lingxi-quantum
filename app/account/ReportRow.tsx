import DeletableReportRow from "./DeletableReportRow";
export default function ReportRow(props:{id:string;title:string|null;date:string}){return <DeletableReportRow {...props} kind="lifemap" href={"/life-map/full?id="+props.id}/>;}
