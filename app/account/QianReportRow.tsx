import DeletableReportRow from "./DeletableReportRow";
export default function QianReportRow(props:{id:string;title:string|null;date:string}){return <DeletableReportRow {...props} kind="qian" href={"/qian?archive="+props.id}/>;}
