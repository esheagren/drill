# Problems and the explanation workbench

DesignSpace is the development environment for Erik and AI collaborators. Its
catalog, handles, rules, and editing controls are not learner-facing navigation.

## Using the workbench

1. Open `/designspace/problems`. Search by concept, name, or skill ID, or filter
   by representation. Each family has an anchor, a transfer example, and a
   boundary example. These are design fixtures, not a new practice curriculum.
2. Open a family in `/designspace/workbench`. Both explanation candidates use the
   same numbers. Apply custom numbers to compare them on another case.
3. Select a candidate to inspect it in the shared trainer feedback layout. Check
   the 320, 390, and 480 px previews, individual steps, and the complete correction.
   The preview arrow cycles fixtures and never records a learner attempt.
4. Star promising strategies, rule out others, and write notes under the candidate
   or problem handle. Candidate notes apply across examples; include the numbers
   in a note when feedback concerns a particular case.
5. **Save study** persists the applied numbers and selected candidate. On another
   visit, **Restore saved study** opens that shared selection. Unsaved field edits
   must be applied before saving. A copied study link explicitly preserves its
   own values, independent of the shared study.
6. **Copy AI brief + feedback** exports the exact case, both explanation plans,
   representation rules, shortlist/exclusions, prerequisite assumptions, limits,
   transfer fixtures, saved notes, and a reproducible link. Wait for the notes'
   “saved” indicator before copying.

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
