# SASI Model-Authored Code Stage IV — V10.60

V10.60 is the first stage where a model-authored code candidate can enter the same isolated self-coding machinery already proven by V10.22.1.

## Full path

```text
failure episode
→ failure attribution
→ falsifiable hypothesis
→ code intervention requested
→ model receives only declared editable files
→ structured code-authoring JSON
→ policy validation
→ risk assessment
→ Patch Proposal
→ detached Git worktree
→ explicit foundation overlay
→ explicit proposal-target overlay
→ baseline TypeScript
→ candidate write
→ candidate TypeScript
→ diff/SHA evidence
→ destroy sandbox
→ benchmark stage
→ human approval
```

## No unrestricted repository access

The code author does not receive the repository by default.

It receives only explicitly declared target files.

Its output is rejected if it names a target outside that declaration.

The existing code-evolution policy then independently checks that the target is in an evolvable zone.

This creates two gates:

```text
declared target gate
AND
evolvable-zone gate
```

## Output contract

The model must return full file content in structured JSON.

It cannot return arbitrary shell commands or claim a deployment.

The output contains:

```text
summary
rationale
expected effect
full proposed file contents
test plan
known risks
assumptions
```

## Risk layer

Every proposal gets a risk assessment.

Network behavior and persistence writes raise risk sharply.

Protected/immutable paths are blocked.

All levels still require human review in Stage IV.

## Generic sandbox runner

Unlike V10.22.1's fixed probe, V10.60 accepts a proposal JSON path.

It overlays only:

1. the explicit SASI foundation manifest
2. the proposal's explicitly named target files

It never enumerates the full dirty repository.

## Main-worktree integrity

For existing target files, the runner verifies the main file SHA remains equal to the proposal's `beforeSha256`.

Candidate writes happen only in the detached worktree.

## Installation safety

The installer performs a deterministic fixture proposal, not a paid model call.

Expected:

```text
provider calls: 0
provider spend: 0
main worktree unchanged
```

## Next major stage

After Stage IV is proven, SASI can connect a configured Teacher/Reasoner provider to the code-authoring contract.

That real call should remain separately opt-in because it can spend provider credits.
