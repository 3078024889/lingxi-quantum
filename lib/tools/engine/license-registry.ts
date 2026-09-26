import type {LicenseProfile} from "./types";

const trace={artifactSha256:undefined as string|undefined,version:undefined as string|undefined,commit:undefined as string|undefined,reviewedAt:"2026-09-26"};
export const LICENSE_REGISTRY:Record<string,LicenseProfile>={
 "browser-native":{...trace,codeLicense:"Web Platform",commercialUse:"allowed",approvedRuntime:["browser"]},
 "mit":{...trace,codeLicense:"MIT",spdx:["MIT"],commercialUse:"allowed",approvedRuntime:["browser","server"]},
 "apache2":{...trace,codeLicense:"Apache-2.0",spdx:["Apache-2.0"],commercialUse:"allowed",approvedRuntime:["browser","server"]},
 "apache2-or-mpl2":{...trace,codeLicense:"Apache-2.0 OR MPL-2.0",spdx:["Apache-2.0","MPL-2.0"],commercialUse:"allowed",approvedRuntime:["browser","server"]},
 "realesrgan-review":{...trace,codeLicense:"BSD-3-Clause",modelLicense:"REVIEW_PER_MODEL_ARTIFACT",datasetLicense:"REVIEW_TRAINING_DATA_PROVENANCE",commercialUse:"review",approvedRuntime:["server-reviewed"]},
 "kokoro-review":{...trace,codeLicense:"Apache-2.0",modelLicense:"Apache-2.0",commercialUse:"review",redistributionNotes:"Kokoro code/weights are permissive, but production speech frontend/phonemizer dependencies such as espeak-ng must be reviewed separately.",approvedRuntime:["server-reviewed"]},
 "bsd2":{...trace,codeLicense:"BSD-2-Clause",spdx:["BSD-2-Clause"],commercialUse:"allowed",approvedRuntime:["browser","server"]},
 "bsd3":{...trace,codeLicense:"BSD-3-Clause",spdx:["BSD-3-Clause"],commercialUse:"allowed",approvedRuntime:["browser","server"]},
 "usda-cc0":{...trace,codeLicense:"N/A",datasetLicense:"CC0 / Public Domain",spdx:["CC0-1.0"],commercialUse:"allowed",approvedRuntime:["database"]},
 "nutrition5k":{...trace,codeLicense:"N/A",datasetLicense:"CC-BY-4.0",spdx:["CC-BY-4.0"],commercialUse:"allowed",attributionRequired:true,approvedRuntime:["research"]},
 "ffmpeg-review":{...trace,codeLicense:"LGPL/GPL build-dependent",commercialUse:"review",redistributionNotes:"Approve the exact production binary/configuration; GPL components can change obligations.",approvedRuntime:["server-reviewed","browser-reviewed"]},
 "libheif-review":{...trace,codeLicense:"LGPL-3.0-or-later",commercialUse:"review",redistributionNotes:"Review dynamic/static linking and redistribution path.",approvedRuntime:["server-reviewed"]},
 "exiftool-review":{...trace,codeLicense:"Artistic-1.0-Perl OR GPL-1.0-or-later",commercialUse:"review",approvedRuntime:["server-reviewed"]},
 "gfpgan-review":{...trace,codeLicense:"Apache-2.0",modelLicense:"REVIEW_PER_MODEL_ARTIFACT",datasetLicense:"REVIEW_TRAINING_DATA_PROVENANCE",commercialUse:"review",approvedRuntime:["server-reviewed"]},
 "gotenberg-review":{...trace,codeLicense:"MIT (Gotenberg) + bundled component licenses",commercialUse:"review",redistributionNotes:"Review the actual container image, Chromium, LibreOffice, PDF engine and font redistribution.",approvedRuntime:["server-reviewed"]},
 "agpl-deny":{...trace,codeLicense:"AGPL / commercial dual license",commercialUse:"denied",networkCopyleft:true,sourceDisclosure:true,approvedRuntime:[]},
};

export function isApprovedForProduction(p:LicenseProfile){return p.commercialUse==="allowed";}
