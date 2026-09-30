import type {PersonDNA,ProjectDNA,ResultDNA} from "./continuity";
export interface ContinuitySnapshot{person?:PersonDNA;project:ProjectDNA;results:ResultDNA[]}
export function continuityContext(x:ContinuitySnapshot){const successful=x.results.filter(r=>r.accepted).slice(-20);return {person:x.person?{preferences:x.person.preferences,confirmedChoices:x.person.confirmedChoices}:undefined,project:{projectId:x.project.projectId,kind:x.project.kind,goal:x.project.goal,decisions:x.project.decisions,state:x.project.state},successfulPatterns:successful.map(r=>({path:r.route,metrics:r.metrics}))}}
