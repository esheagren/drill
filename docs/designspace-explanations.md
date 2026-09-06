# Problems and the explanation workbench

DesignSpace is the development environment for Erik and AI collaborators. Its
catalog, handles, rules, and editing controls are not learner-facing navigation.

## Organization

- **Review**: active design questions, recent changes, one current product screen,
  and the existing task list.
- **Explore**: screen options, explanation studies, and sketches. One preview is
  visible by default; turn on Compare for an alternative.
- **Reference**: product brief, principles, problem families, and representations.

The existing page URLs and handles remain stable. Help lives at
`/designspace/help`; the global feedback archive is under Utilities.

## Using the workbench

1. Choose a problem family and an anchor, transfer, or boundary example. These
   are design fixtures, not a new practice curriculum. Expand Change the numbers
   to apply another case.
2. Select an explanation to inspect in the shared trainer feedback layout.
   Compare uses the same numbers for both strategies. Check the 320, 390, and
   480 px previews, individual steps, and the complete correction. The preview
   arrow cycles fixtures and never records a learner attempt.
3. Add feedback beside the preview. Each submitted note captures its example,
   view, build version, and link. Drafts survive switching examples within the
   browser session. Resolve finished feedback; show Resolved to reopen it.
   Existing freeform notes remain available under Earlier notes.
4. Star promising strategies and rule out others. Stars are a shortlist;
   selecting a preview does not choose it for implementation. Expand
   Implementation decision to record a choice and its reason, or reopen it.
5. **Save study** persists applied numbers and the selected candidate. **Restore
   saved study** opens that shared selection. A copied study link preserves its
   own values and view, independent of the shared study.
6. **Copy this review** exports the selected case and plans, representation rules,
   transfer fixtures, relevant open feedback, earlier notes, and recorded
   decisions. Comparison adds the other candidate to this scope. Add a draft
   before copying. Utilities → Copy all saved feedback includes the full archive.

Example request: “Compare E-compensate/area and E-compensate/line on the boundary
example. Keep the correction visible at 320 px, then check 97 × 6.”

## Data and code

| Source | Responsibility |
| --- | --- |
| `content/designspace/problems.ts` | Problem families, concepts, skills, field bounds, fixtures, candidate strategies, and representation rules |
| `lib/explanationPlan.ts` | A single plan supplies the calculation, explanation sentences, and diagram geometry |
| `components/ExplanationDiagram.tsx` | Renders the plan's bars, areas, and linear number lines |
| `components/FeedbackBody.tsx` | Shared layout used by the existing trainer and candidate previews |
| `components/ExplanationWorkbench.tsx` | Developer controls, comparison, persistence, notes, and export |

Handles: `P-<family>` names a problem family; `E-<family>/<strategy>` names a
candidate; `W-bar`, `W-array`, and `W-line` name representation families. Keep
handles stable so saved feedback remains attached. The existing authenticated
notes API stores stars, exclusions, and notes. `study P-<family>` stores a version-1
JSON record containing `values` and `candidate`; no database migration is needed.
Studies are shared and use the existing wall's last-write-wins behavior.

New feedback uses `review <scope>/<id>` with a version-1 JSON record containing
text, target, resolved status, and review context. Implementation choices use
`decision <scope>` with choice, reason, context, status, and timestamp. Screen
preview selections use `preview screen-options`. Legacy `pick`, `status`, star,
exclusion, and freeform note keys remain intact. Choosing a screen option updates
its legacy pick/status records; reopening changes its status back to working.
There is no database migration. Preview links can override the shared selection
without changing it.

To add a family, define its structural unknown, intended insight, possible error
(as a hypothesis), input bounds, and at least three fixtures. Add candidate moves
and a plan implementation. Derive prose and geometry from the same calculation.
Extend the diagram schema only when its semantics are clear. The `line` schema
here is linear; it does not implicitly reuse the production logarithmic line.

These candidates are explicitly experimental. Saving or starring one does not
change the trainer's `widgetSeedFor` routing or `sentencesFor` explanations.
Promotion requires a deliberate implementation decision after mathematical,
visual, and learner review. The shared feedback layout extraction preserves the
existing trainer content and behavior.

## Verification

`npm test` checks the benchmark set, compensation on both sides of 100, division
reconstruction, equivalence invariants, percent reference wholes, invalid inputs,
and the editing/save/restore/export flow using a simulated DOM and notes API.
`npm run build` checks Next.js production compilation, lint, and types.

The DOM checks do not establish visual quality or learning effectiveness. Inspect
the narrow preview, dark and light themes, and transfer examples with learners
before promoting a candidate.
