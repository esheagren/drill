# Mental arithmetic & rational-number trajectory

*Design note, 2026-08-29. Compares Drill's coverage with three curricula, encodes a learning trajectory, and specifies the quiet placement system.*

## 1. How Drill compares

Three references, chosen because they are explicit about **mental** calculation, not just written algorithms:

- **Singapore MOE, Primary Mathematics Syllabus 2021** (P1–P6). Mental calculation is a named objective at every level P1–P3 and returns as ×/÷ by 10, 100, 1000 "and their multiples" at P5.
- **Hong Kong EDB, Learning Content of Primary Mathematics 2017** (KS1–KS2). "Estimate the result of calculations" is a running expectation attached to nearly every arithmetic unit; percent inter-conversion and percent change are P6.
- **Common Core (CCSS-M)**. Fluency standards: add/subtract within 20 from memory (2.OA.C.7), single-digit products from memory (3.OA.C.7), then *written* multi-digit fluency (4.NBT.B.4, 5.NBT.B.5). Almost nothing on mental methods after grade 3; exponents and scientific notation arrive in grade 8 (8.EE.A).

The UK national curriculum is a useful fourth voice (tables to 12×12 with a statutory check at year 4; ×/÷ by 10, 100, 1000 as mental work) and agrees with the first two.

### Strand-by-strand

| Strand | Singapore | Hong Kong | CCSS | Drill today |
|---|---|---|---|---|
| Additive facts & mental ± | P1: within 20; 2-digit ± ones/tens. P2: 3-digit ± ones/tens/hundreds. P3: two 2-digit numbers | KS1 addition/subtraction with estimation | 2.OA.C.7 within 20; 3.NBT.A.2 within 1000 | **Missing** |
| Multiplication & division facts | P2: tables 2, 3, 4, 5, 10. P3: 6, 7, 8, 9; division within tables; remainders | P2: "multiplication table (0–10)" | 3.OA.C.7 | Tables **to 25**, squares, cubes ✔ — division facts **missing** |
| Place value, ×÷ by powers of ten | P4: to 100 000, rounding to 10/100/1000. P5: to 10 million; ×÷ 10, 100, 1000 and multiples | P4–P6 large numbers; P6: ÷ 10, 100, 1000 | 4.NBT.A.1, 5.NBT.A.2 | Count zeros, word → 10ⁿ ✔ — rounding, ×÷ by 10ⁿ on arbitrary numbers **partial** |
| Multi-digit mental strategies | Implicit in "mental calculation" objectives; 2-digit × 1-digit via algorithm P3 | Estimation of results throughout | None after grade 3 | 13–25 tables only; compensation, doubling/halving, ×5/×25/×11, distributive splits **missing** |
| Factors, multiples, divisibility | P4: factors, multiples, common factors/multiples | P4–P5 | 4.OA.B.4 | **Missing** |
| Fractions (equivalence, compare, ± ) | P2–P4: denominators ≤ 12; like → related → unlike; mixed numbers | P3–P5 | 3.NF, 4.NF, 5.NF | **Missing** |
| Fraction ↔ decimal ↔ percent | P4: fraction → decimal when denominator divides 10/100. P5: any fraction → decimal; percentage of a whole | P6: percentage ↔ fraction ↔ decimal inter-conversion | 4.NF.C.6, 7.NS.A.2d | Fraction → % ✔ — the other four directions **missing** |
| Decimals | P4: ± to 2 dp, ×÷ by 1-digit, rounding decimals. P5: ×÷ by 10, 100, 1000 | P4–P6 | 5.NBT.B.7 | **Missing** |
| Percent of a quantity, percent change | P5: % part of a whole; discount, GST, interest. P6: percent increase/decrease (2013 syllabus) | P6: "what % of 50 is 30", increase from 100 to 120, decrease from 120 | 6.RP.A.3c, 7.RP.A.3 | Anchors and composition ✔ — percent change, reverse percent **missing** |
| Ratio, rate, unit conversion | P5: rate. P6: ratio, speed | P5–P6 | 6.RP, 7.RP | **Missing** |
| Exponents & scientific notation | — | — | 8.EE.A.1, 8.EE.A.3, 8.EE.A.4 | ✔ (stronger than any of the three) |
| Order-of-magnitude estimation | — (estimation of results, not magnitude) | — | 8.EE.A.3 | ✔ (Drill's distinctive strand) |

**Verdict.** Drill covers roughly a third of the mental arithmetic and rational-number trajectory that all three systems share, and it covers the top of the ladder (exponents, scientific notation, magnitude) better than any of them. What is missing is the spine the curricula are built on: additive fluency and compensation, division and divisibility, multi-digit mental strategies, fraction equivalence and arithmetic, decimals, and percent change. Singapore is the best model for *which* mental skills matter and in *what order*; Hong Kong for the insistence that every calculation carries an estimate; CCSS for the exponent/scientific-notation top end.

## 2. The trajectory, encoded

Eight levels. Each node is a skill in Drill's sense (a generator, a rating, a map). Arrows are prerequisites the placement system will reason over. `✔` exists today, `◐` partial, `✗` to build.

```
L0  Number sense
    place value to 1 000 ✗ · number bonds to 10 and 20 ✗

L1  Additive facts                                            (Singapore P1–P3)
    ± within 20 ✗ · doubles & near-doubles ✗ · 2-digit ± ones/tens ✗
    · 2-digit ± 2-digit (bridging, compensation) ✗ · 3-digit ± ones/tens/hundreds ✗

L2  Multiplicative facts                                      (Singapore P2–P3, CCSS 3.OA.7)
    tables 2, 5, 10 ✔ → 3, 4 ✔ → 6–9 ✔ (as "0–12") · division facts within tables ✗
    · squares 0–12 ✔

L3  Place value & scaling                                     (Singapore P4–P5, CCSS 5.NBT.2)
    count the zeros ✔ · word ↔ 10ⁿ ✔ · ×÷ any number by 10, 100, 1000 ◐
    · rounding to 10/100/1000 ✗ · reading numbers to trillions ◐

L4  Multi-digit mental strategies                             (Singapore "mental calculation", UK NC)
    tables 13–20 ✔ · 21–25 ✔ · squares 13–25 ✔ · cubes ✔
    · 2-digit × 1-digit (distributive split) ✗ · ×5 = ×10÷2, ×25 = ×100÷4, ×11 ✗
    · doubling & halving chains ✗ · near-100 products (98×7) ✗
    · division by 1-digit with remainder ✗ · divisibility 2,3,4,5,9,10 ✗ · factor pairs ✗

L5  Rational numbers                                          (Singapore P2–P5, CCSS 3–5.NF, 5.NBT.7)
    unit fraction → % ✔ · fraction → % ✔ · equivalent & simplest form ✗ · compare fractions ✗
    · fraction ± (like → related → unlike, denominators ≤ 12) ✗ · fraction × whole ✗
    · fraction ↔ decimal (denominator divides 10/100; then any) ✗ · % → fraction, decimal ↔ % ✗
    · decimals ×÷ by 10, 100, 1000 ✗ · decimal ± and × 1-digit ✗ · rounding decimals ✗
    · 10%/1%/50%/5% anchors ✔ · compose percents ✔

L6  Proportional reasoning                                    (Singapore P5–P6, HK P6, CCSS 6–7.RP)
    percent increase/decrease ✗ · reverse percent (whole from part) ✗ · "what % of 50 is 30" ✗
    · percent points vs percent ✗ · ratio & rate ✗ · unit conversion (km↔m, kg↔g, h↔min) ✗
    · discount, tax, simple interest ✗ · speed = distance ÷ time ✗

L7  Scaling & magnitude (adult extension)                     (CCSS 8.EE; Fermi practice)
    add/subtract exponents ✔ · coefficient facts ✔ · digits/words → sci ✔ · renormalize ✔
    · multiply/divide in sci ✔ · magnitude of a product/quotient ✔
    · log₁₀ as order of magnitude ✗ · rule of 72, doubling times ✗ · compound growth ≈ ✗
```

Prerequisite edges (the ones the inference uses; others are obvious within a level):

- L1 ± within 20 → every L1/L4 multi-digit ± strategy → decimal ± (L5)
- tables 0–12 → division facts → divisibility, remainders → simplest form, related-denominator ± (L5)
- tables 0–12 + count the zeros → ×÷ by 10ⁿ → decimals ×÷ 10ⁿ, sci-notation renormalize
- 2-digit × 1-digit → tables 13–25 (the decomposition is the same move) → coefficient products in sci (L7)
- unit fraction → % → fraction → % → % ↔ decimal ↔ fraction → percent change, reverse percent (L6)
- anchors → compose percents → percent change; rounding → magnitude estimation

**Units to add** (grouped the way the Skills screen groups them): *Additive fluency* (L1), *Division & divisibility* (L2/L4), *Multi-digit strategies* (L4), *Fractions core* (L5), *Decimals* (L5), *Conversions* (L5), *Percent change & ratio* (L6), *Rounding & estimation* (L3/L5), *Growth* (L7). About 28 new skills; each is a generator plus a map spec, like the 23 that exist.

## 3. Placement without a test

**Goal.** The system should know, for every node, how likely it is that you have it — and how *automatic* it is — without ever presenting a thing called a diagnostic. It should get there over a week of ordinary sessions, mostly by inference, and keep refining forever.

**Model.** This is knowledge-space theory as used by ALEKS (Doignon & Falmagne): the prerequisite graph constrains which sets of known skills are plausible, so one answer carries information about many nodes.

- Each node holds a belief `p(known)` and a fluency estimate (the existing per-skill speed EMA and the Elo rating already provide the second).
- **Prior**: `p = logistic(frontier − level)` — nodes below the learner's estimated frontier start near 1, above it near 0. The frontier is initialized from what is already observed (for Erik: L0–L3 and much of L4/L5/L7 are effectively known, so the frontier sits at L4–L6).
- **Evidence**: a correct, fast answer at node X multiplies belief on X *and every ancestor* toward 1 (damped by distance: factor 0.6 per edge). A miss, or a correct-but-slow answer, pushes X and every *descendant* toward 0 the same way. Slow-correct is treated as "known, not automatic": belief up, fluency down.
- **Probe selection**: when the scheduler decides to probe (see below), it picks the node whose belief is closest to 0.5, weighted by how many other nodes an answer there would move — the node on the *fringe* with the largest ancestor+descendant set. This is a binary search over the ladder; ~60 probes resolve ~150 nodes to within ±0.15.

**How it shows up in practice.**

- Every session reserves about 15% of items as probes, silently. They look and score like any other item; only the log marks them `probe = true`. Weeks later the share drops to ~5% (maintenance of the belief map).
- The first week's mixed practice is therefore mostly the things you already do well plus probes at the fringe — which is what a good tutor would do on day one anyway.
- Ordinary practice keeps updating beliefs: every answer is evidence, probe or not.
- Selection for *practice* (as opposed to probing) targets nodes with belief 0.4–0.8 — the zone where practice changes something — plus the existing maintenance draws. Nodes with belief < 0.2 whose prerequisites are also uncertain are not served until the prerequisites firm up.

**What you see.** No "diagnostic" screen. In Skills, a node's dot is solid when observed and *hollow* when inferred; hovering says "inferred from fraction → % and unit fractions". History gains one line per unit: the current frontier. That is the whole interface.

**Fit with what exists.** The trajectory's nodes are the skills; the unit rating θ and per-item β stay as they are. Beliefs are a new field in the engine state (synced like everything else); probes are a new item source in `pickItem`; the propagation is ~60 lines. The only schema change is `probe boolean` on `attempts`.

## 4. Sequence

1. Encode the trajectory in `lib/skills.ts`: `level`, full `prereqs`, knowledge-component tags. (Half a day.)
2. Build the missing generators and map specs, one unit at a time, starting where inference for Erik is most uncertain: Multi-digit strategies (L4), Fractions core (L5), Percent change (L6). (~2 days for all nine units.)
3. Belief engine + probe scheduling + hollow dots. (1 day.)
4. Tune damping, probe share and thresholds against the logged data. (Ongoing.)

### Sources
- Singapore MOE, *Mathematics Syllabus Primary One to Six* (2021, updated Oct 2025): https://www.moe.gov.sg/api/media/92bff26d-b2b4-4535-b868-b8415c744b91/2021-Primary-Mathematics-Syllabus-P1-to-P6-Updated-October-2025.pdf
- Hong Kong EDB, *Supplement to Mathematics Education KLA Curriculum Guide: Learning Content of Primary Mathematics* (2017): https://www.edb.gov.hk/attachment/en/curriculum-development/kla/ma/curr/pmc2017_e.pdf
- Common Core State Standards for Mathematics: https://www.thecorestandards.org/Math/
- Doignon & Falmagne, *Knowledge Spaces* (1999); ALEKS assessment method.

## 5. Scope revision — an app for adults (2026-08-29)

Drill is for adults. The eight-level ladder stays as the *map* the placement reasons over, but the product concentrates on the upper half; the lower half is an **on-ramp** that exists to be checked, not drilled.

**On-ramp** (L0–L3 compressed to ~6 check skills): ± within 100 with compensation · tables 0–12 · division facts · ×÷ by 10ⁿ · rounding · reading numbers to trillions. Never in the default mix; it is where silent probes go first. Cleared in ~10 probes over the first two sessions for most adults, after which it fades and only resurfaces if a later miss implicates it (a slow 13×17 that looks like a 7×3 problem). A genuine gap gets a short refresh loop, then fades again.

**Core** (the adult working set):
- *Multiplicative arithmetic*: tables to 25, squares, cubes, 2-digit × 1-digit, ×5 / ×25 / ×11, doubling–halving, near-100 products, division with remainder
- *Fractions*: unit fractions ↔ %, n/d ↔ %, equivalence and simplest form, compare, fraction of a quantity, fraction × whole
- *Percents*: anchors, compose, percent change, reverse percent, "what % is", percent points, discount / tax / interest
- *Decimals & scaling*: ×÷ by 10ⁿ on any number, decimal ↔ fraction ↔ %, rounding to sensible precision
- *Scientific notation*, *Operating in sci* (as built)
- *Magnitude*: as built, plus log₁₀ as order of magnitude, rule of 72 / doubling times, compound growth ≈

**Combinations** — the top unit and the point of the app. Multi-step items that chain two or three core skills the way numbers arrive in real life, each tagged with the skills it uses so a miss updates the components:
- 15% of 2.4 million (anchor → scale) · 3/8 of 640 000 (fraction of quantity → magnitude)
- 250k up 40% then down 25% (successive change) · 6.8×10⁷ people ÷ 3.4×10⁵ doctors (sci division → words)
- which is bigger, 3.2 billion or 4.5×10⁸ (sci ↔ words) · 1/12 of 3 billion in sci (fraction → sci)
- 7% growth — years to double (rule of 72) · 40% off then 8% tax (chained percents)

**Placement under this scope**: ~35 nodes instead of ~60; on-ramp resolved by inference in a session or two; probes then spend their budget on the core / combination fringe.

**Build order**: (1) encode the revised structure · (2) Percents — the biggest adult gap and the shortest path to combinations · (3) multi-digit strategies + division · (4) fractions core + decimals/scaling · (5) Combinations · (6) belief engine · on-ramp generators last (probe targets only).
