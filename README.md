# Magnitude

Adult mental arithmetic trainer. Opens straight into interleaved practice; no menus, no login.

## How it works

**Identity.** A UUID is minted in `localStorage` on first visit (`lib/user.ts`). All learner state is namespaced under it, so a sync layer can be added later without changing the app.

**Skills.** Practice is decomposed into 15 atomic skills (`lib/skills.ts`), each with prerequisites, a target latency, and the Common Core standard it comes from:

| Family | Skill | Example | CCSS |
|---|---|---|---|
| Place value | Count the zeros | `1,000,000 → 6` | 5.NBT.A.2 |
| | Word → power of ten | `a hundred million → 8` | 4.NBT.A.2 |
| Exponents | Add exponents | `10^7 × 10^3 → 10` | 8.EE.A.1 |
| | Subtract exponents | `10^9 ÷ 10^4 → 5` | 8.EE.A.1 |
| | Coefficient facts | `7 × 8 → 56` | 3.OA.C.7 |
| Scientific | Digits → scientific | `68,000,000 → 6.8e7` | 8.EE.A.3 |
| | Words → scientific | `sixty-eight million → 6.8e7` | 8.EE.A.3 |
| | Scientific → words | `2 × 10^11 → 200 billion` | 8.EE.A.3 |
| | Renormalize | `48 × 10^7 → 4.8e8` | 8.EE.A.4 |
| | Multiply in scientific | `(6e7)(3e3) → 1.8e11` | 8.EE.A.4 |
| | Divide in scientific | `(8e9)/(2e4) → 4e5` | 8.EE.A.4 |
| Magnitude | Magnitude of a product | `68 million × 3 thousand → ~200 billion` | 8.EE.A.3/4 |
| | Magnitude of a quotient | `8 billion ÷ 40 thousand → ~200 thousand` | 8.EE.A.3/4 |
| Percents | 10% / 1% anchors | `10% of 3,400 → 340` | 6.RP.A.3c |
| | Compose percents | `15% of 80 → 12` | 6.RP.A.3c |

**Engine** (`lib/engine.ts`). Per skill: EMA accuracy, EMA latency, streak. Mastery = accuracy discounted while slower than target. A skill unlocks when each prerequisite has ≥5 attempts and mastery ≥ 0.7. Selection is interleaved weighted-random over unlocked skills — weight rises with weakness and time-since-seen, with a floor so mastered skills keep recurring — and never repeats the last skill.

**Items** (`lib/items.ts`). One generator per skill. Answers are a single typed value; the parser accepts `6.8e7`, `6.8 x 10^7`, `6.8 7`, `68 million`, `68m`, `200b`, and plain digits. Estimation skills accept anything within 0.3 orders of magnitude.

**UI** (`components/Trainer.tsx`). Prompt → type → Enter. Correct answers auto-advance; misses show the answer and a one-line why. The `▦` corner opens the skill map.

## Dev

```
npm install
npm run dev
```

Deployed on Vercel; pushes to `main` go to production.
