import DeletableReportRow from "./DeletableReportRow";
export default function RelationshipReportRow(props:{id:string;title:string|null;date:string}){return <DeletableReportRow {...props} kind="relationship" href={"/relationship/full?id="+props.id}/>;}
