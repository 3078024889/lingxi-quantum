# SASI Real Code Author Stage V — V10.70

V10.70 connects the Stage IV code-authoring contract to a real provider transport.

## What is now real

A configured teacher adapter can now:

```text
receive a bounded failure/hypothesis context
receive only explicitly declared target files
generate structured replacement file content
be parsed into a Patch Proposal
receive code-risk classification
enter the existing detached-worktree sandbox
```

The current first provider path is compatible with the already implemented Ark teacher adapter.

## What the model does NOT get

The model does not receive:

```text
the whole repository
.env
provider keys
git shell access
database credentials
deployment permission
production merge permission
```

It receives only the declared target file contents and their SHA-256 values.

## Provider transport reuse

Stage V deliberately reuses the generic `SasiTeacherAdapterRegistry`.

The provider is a transport/teacher, not SASI itself.

The code-author contract remains SASI-owned.

## Default paid-call policy

Default:

```text
allowPaidCall = false
maxProviderCalls = 1
maxTargetFiles = 3
maxBytesPerFile = 96 KiB
maxOutputTokens = 2600
allowedRiskLevels = low, medium
```

A real provider call must be enabled explicitly by the server-side caller.

## Risk analysis

After the model returns code, Stage V independently inspects the proposed content.

Risk is raised for:

```text
public export changes
network behavior
persistence writes
large changes
multi-file changes
```

Protected paths remain blocked by Stage IV policy.

## Installation behavior

The installer does NOT make a paid provider call.

It checks:

- V10.20-V10.60 foundations
- real code-author runtime
- explicit paid-call policy
- preflight scripts
- TypeScript
- secret patterns
- Stage IV sandbox evidence remains intact

Provider spend during install remains zero.

## First real use

Before a real call:

1. run the preflight
2. pick one small evolvable target
3. define one concrete failure + hypothesis
4. allow exactly one provider call
5. produce a proposal
6. run V10.60 sandbox
7. benchmark
8. inspect evidence
9. human approve or discard

Do not begin with a large multi-file refactor.
