# P4 Candidate Transaction Design

Date: 2026-09-08

## Goal

P4 guarantees that an experimental refactor cannot damage the approved working section. The transaction boundary is:

`clone -> transform candidate -> validate -> commit/swap OR discard`

P4 is infrastructure. It does not decide which layout recipe should run; P5 owns Safe Fix recipes.

## Core invariant

The approved original node is never passed to the transformer. Only a candidate handle can be transformed.

A transaction may reach commit only after P3 returns `passed: true`.

## State machine

Current core states:

- `IDLE`
- `CLONING`
- `TRANSFORMING`
- `VALIDATING`
- `DISCARDING`
- `COMMITTING`
- `COMMITTED`
- `REJECTED`
- `FAILED`

Every transaction returns a small serializable event journal for audit/debugging.

## Candidate handle

The core transaction layer tracks only stable root-level references:

- approved `originalNodeId`,
- temporary `candidateNodeId`.

It does not require descendant IDs to match. P3 already compares content/geometry/render invariants independently of wrapper IDs.

## Failure behavior

### Clone fails

No candidate exists and no commit can occur.

### Transform fails

The candidate is discarded. The original remains untouched.

### Validation crashes or rejects

The candidate is discarded. The original remains untouched. Commit is unreachable.

### Discard fails

The transaction fails loudly with `failureStage: discard`; it does not continue to commit.

### Commit fails

The core does not blindly delete the candidate after commit has begun because an adapter may already have crossed the root-swap boundary. The Figma adapter must make commit recoverable and auditable.

## Commit strategy for Figma integration

The preferred Figma adapter will use root replacement rather than replaying descendant mutations onto the approved original.

Planned sequence after validation passes:

1. record original parent + sibling index + original geometry/name,
2. prepare the validated candidate for the approved slot,
3. create a small undo checkpoint referencing the original root,
4. swap the candidate into the original slot at the root boundary,
5. retain or relocate the previous original only according to the bounded undo policy,
6. write only small transaction metadata,
7. emit commit evidence.

The adapter must not store PNGs, large serialized node trees or full design snapshots in plugin data.

## Undo/checkpoint direction

A bounded single-step plugin checkpoint is preferred over storing large serialized snapshots. The checkpoint may reference a retained original root or other small opaque adapter token. Exact Figma placement/retention semantics will be proven before P4 merge.

## Current test evidence

The pure transaction engine uses an in-memory adapter fixture to prove:

- forced transform failure leaves the approved original unchanged,
- rejected P3 validation leaves the approved original unchanged,
- failed candidates are discarded,
- commit is never called after transform/validation failure,
- passing validation permits commit,
- successful commit returns small audit evidence,
- cleanup failures are explicit,
- commit-stage errors are separated from pre-commit failures.

## Safety gate before P5

P4 is not complete until the Figma adapter itself proves, on a controlled fixture, that forced failed candidates cannot alter the approved working section and that candidate cleanup is reliable.
