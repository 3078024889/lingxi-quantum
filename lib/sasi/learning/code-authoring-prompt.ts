import {
  SASI_CODE_AUTHOR_SYSTEM_RULES,
  type SasiCodeAuthoringInput,
} from "@/lib/sasi/learning/code-authoring-contract";

export function buildCodeAuthorMessages(input: SasiCodeAuthoringInput) {
  return [
    {
      role: "system" as const,
      content: [
        ...SASI_CODE_AUTHOR_SYSTEM_RULES,
        "",
        "只输出JSON对象：",
        "{",
        '  "summary": string,',
        '  "rationale": string,',
        '  "expectedEffect": string,',
        '  "files": [{"path": string, "proposedContent": string}],',
        '  "testPlan": string[],',
        '  "knownRisks": string[],',
        '  "assumptions": string[]',
        "}",
      ].join("\n"),
    },
    {
      role: "user" as const,
      content: [
        `Repository HEAD: ${input.repositoryHeadSha}`,
        "",
        "Failure:",
        JSON.stringify(input.failure),
        "",
        "Hypothesis:",
        JSON.stringify(input.hypothesis),
        "",
        "Editable target files:",
        JSON.stringify(
          input.targetFiles.map((file) => ({
            path: file.path,
            currentSha256: file.currentSha256,
            currentContent: file.currentContent,
          })),
        ),
      ].join("\n"),
    },
  ];
}
