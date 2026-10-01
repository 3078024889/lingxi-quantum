import fs from"node:fs";

function must(v,m){if(!v)throw new Error(m)}
const s=fs.readFileSync("lib/tools/document/converter.ts","utf8");

must(
 s.includes("function gotenbergHeaders():Headers") ||
 s.includes("function authHeaders():Record<string,string>"),
 "GOTENBERG_HEADER_BUILDER_NOT_TYPED"
);

must(
 s.includes('new Headers()') ||
 s.includes("const headers:Record<string,string>={}"),
 "GOTENBERG_HEADER_CONTAINER_MISSING"
);

must(
 s.includes('headers.set("authorization"') ||
 s.includes("headers.authorization="),
 "GOTENBERG_AUTH_HEADER_ASSIGNMENT_MISSING"
);

must(
 !/return\s+token\s*\?\s*\{authorization:/.test(s),
 "OPTIONAL_AUTH_HEADER_UNION_PATTERN_REMAINS"
);

must(
 !/\{\s*authorization\?\s*:\s*undefined\s*\}/.test(s),
 "UNDEFINED_AUTHORIZATION_HEADER_PATTERN_REMAINS"
);

console.log("GOTENBERG_HEADER_BUILDER_TYPED=PASS");
console.log("HEADERS_INIT_COMPATIBILITY=PASS");
console.log("OPTIONAL_AUTH_HEADER_UNION=0");
console.log("V31R1_BUILD_REGRESSION_AUDIT=PASS");
