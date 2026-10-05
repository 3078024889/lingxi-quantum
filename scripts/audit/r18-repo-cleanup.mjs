import fs from"node:fs";
const forbidden=[
 ".mini-v5-backup-20261004-101944",
 ".mini-v5-r2-backup-20261004-102617",
 ".mini-v5-r2-backup-20261004-103308"
];
const leftovers=forbidden.filter(p=>fs.existsSync(p));
if(leftovers.length)throw new Error("R18_TRACKED_BACKUP_DIRS_REMAIN:"+leftovers.join(","));
console.log("R18_TRACKED_OLD_BACKUPS_REMOVED=PASS");
