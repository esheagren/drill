import type { Tip } from "./tips";

/** Compiled 2026-08-29 from GMAT-prep methods, Benjamin *Secrets of Mental Math*, the Trachtenberg system, Vedic shortcuts and standard divisibility rules. Every example checked by hand. */
export const TIPS: Tip[] = [
 {
  "id": "split-tens-ones",
  "title": "Split the two-digit number by place",
  "rule": "Multiply the tens part and the ones part by the one-digit number separately, then add.",
  "example": "47 × 6: 40×6 = 240, 7×6 = 42 → 282",
  "when": "Any two-digit × one-digit product where neither factor is near a round number.",
  "tags": [
   "distributive-split",
   "mul-facts",
   "add-partials"
  ],
  "skills": [
   "ar.split"
  ]
 },
 {
  "id": "round-up-subtract-back",
  "title": "Round up, multiply, subtract the excess",
  "rule": "When a factor is just below a multiple of ten, multiply by the round number and subtract the small overshoot times the other factor.",
  "example": "68 × 7: 70×7 = 490, minus 2×7 = 14 → 476",
  "when": "A factor ends in 7, 8, or 9.",
  "tags": [
   "near-multiple-of-ten",
   "compensation",
   "subtraction"
  ],
  "skills": [
   "ar.split",
   "ar.near100"
  ]
 },
 {
  "id": "left-to-right-multiply",
  "title": "Multiply left to right, add as you go",
  "rule": "Break the larger factor by place value, multiply each piece starting with the biggest, and keep a running total.",
  "example": "31 × 42: 30×42 = 1260, 1×42 = 42 → 1302",
  "when": "Two-digit × two-digit when one factor has a small ones digit.",
  "tags": [
   "distributive-split",
   "add-partials"
  ],
  "skills": [
   "ar.mul20",
   "ar.mul25"
  ]
 },
 {
  "id": "difference-of-squares",
  "title": "Symmetric pair around a round number",
  "rule": "If two factors sit equally above and below a middle number m, the product is m² minus the distance squared.",
  "example": "23 × 17: 20² − 3² = 400 − 9 = 391",
  "when": "Factors have the same average and it is easy to square (20, 25, 30, 50, 100).",
  "tags": [
   "difference-of-squares",
   "squares"
  ],
  "skills": [
   "ar.mul20",
   "ar.mul25"
  ]
 },
 {
  "id": "near-100-multiply",
  "title": "Both factors just under 100",
  "rule": "Take each factor's deficit from 100; subtract one deficit from the other factor for the leading part, and multiply the deficits for the last two digits.",
  "example": "97 × 94: deficits 3 and 6; 97−6 = 91; 3×6 = 18 → 9118",
  "when": "Both factors are between about 88 and 100 (Vedic base-100 method).",
  "tags": [
   "near-multiple-of-ten",
   "compensation",
   "difference-of-squares"
  ],
  "skills": [
   "ar.near100"
  ]
 },
 {
  "id": "near-50-multiply",
  "title": "Both factors near 50",
  "rule": "Write each factor as 50 ± a and 50 ± b; product is 2500 + 50(±a ± b) + (±a)(±b).",
  "example": "53 × 48: 2500 + 50×(3−2) + 3×(−2) = 2500 + 50 − 6 = 2544",
  "when": "Both factors are within about 10 of 50.",
  "tags": [
   "squares-near-50",
   "compensation",
   "distributive-split"
  ],
  "skills": [
   "ar.mul25"
  ]
 },
 {
  "id": "same-tens-ones-sum-ten",
  "title": "Same tens digit, ones summing to 10",
  "rule": "Multiply the tens digit by the next integer up for the leading part, then append the product of the ones digits as two digits.",
  "example": "37 × 33: 3×4 = 12; 7×3 = 21 → 1221",
  "when": "Two-digit factors share a tens digit and their ones digits add to 10.",
  "tags": [
   "squares-ending-5",
   "difference-of-squares"
  ],
  "skills": [
   "ar.mul20"
  ]
 },
 {
  "id": "foil-cross-products",
  "title": "FOIL two-digit numbers",
  "rule": "Compute tens×tens, the two cross products, and ones×ones, then add.",
  "example": "23 × 41: 20×40 = 800, 20×1 + 3×40 = 140, 3×1 = 3 → 943",
  "when": "Neither factor is near a round number and no special pattern applies.",
  "tags": [
   "distributive-split",
   "add-partials"
  ],
  "skills": [
   "ar.mul20",
   "ar.mul25"
  ]
 },
 {
  "id": "multiply-by-5",
  "title": "×5 is halve then ×10",
  "rule": "Halve the number and multiply by 10 (append a zero, or move the decimal one place).",
  "example": "86 × 5: 86/2 = 43 → 430",
  "when": "Multiplying by 5, or by 0.5 in reverse.",
  "tags": [
   "halving",
   "decimal-shift",
   "powers-of-ten"
  ],
  "skills": [
   "ar.short5"
  ]
 },
 {
  "id": "multiply-by-25",
  "title": "×25 is quarter then ×100",
  "rule": "Divide by 4 and append two zeros.",
  "example": "48 × 25: 48/4 = 12 → 1200",
  "when": "Multiplying by 25, 2.5, or 0.25.",
  "tags": [
   "multiply-by-25",
   "halving",
   "powers-of-ten"
  ],
  "skills": [
   "ar.short5"
  ]
 },
 {
  "id": "multiply-by-50",
  "title": "×50 is halve then ×100",
  "rule": "Halve the number and append two zeros.",
  "example": "74 × 50: 37 → 3700",
  "when": "Multiplying by 50 or by 0.5 with a decimal shift.",
  "tags": [
   "halving",
   "powers-of-ten",
   "decimal-shift"
  ],
  "skills": [
   "ar.short5"
  ]
 },
 {
  "id": "multiply-by-125",
  "title": "×125 is eighth then ×1000",
  "rule": "Divide by 8 (halve three times) and append three zeros.",
  "example": "48 × 125: 48/8 = 6 → 6000",
  "when": "Multiplying by 125 or 12.5.",
  "tags": [
   "halving",
   "powers-of-ten",
   "unit-fraction-percent"
  ],
  "skills": [
   "ar.short5"
  ]
 },
 {
  "id": "multiply-by-11",
  "title": "×11: add the neighbors",
  "rule": "Write the outer digits as they are and put the sum of the two digits in the middle, carrying if the sum exceeds 9.",
  "example": "78 × 11: 7 | 7+8=15 | 8 → carry → 858",
  "when": "Multiplying any two-digit (or longer) number by 11.",
  "tags": [
   "multiply-by-11",
   "add-partials"
  ],
  "skills": [
   "ar.short11"
  ]
 },
 {
  "id": "multiply-by-12-trachtenberg",
  "title": "×12: double each digit, add neighbor",
  "rule": "Working right to left, double each digit and add the digit to its right (its neighbor); treat a leading zero as the final digit.",
  "example": "34 × 12: 4×2 = 8; 3×2+4 = 10 → write 0 carry 1; 0×2+3+1 = 4 → 408",
  "when": "Multiplying by 12 (Trachtenberg rule); also reachable as ×10 + ×2.",
  "tags": [
   "multiply-by-12",
   "doubling",
   "add-partials"
  ],
  "skills": [
   "ar.mul12",
   "ar.mul20"
  ]
 },
 {
  "id": "multiply-by-15",
  "title": "×15 is ×10 plus half of that",
  "rule": "Multiply by 10, then add half of the result.",
  "example": "48 × 15: 480 + 240 = 720",
  "when": "Multiplying by 15, 1.5, or 150.",
  "tags": [
   "multiply-by-15",
   "halving",
   "add-partials"
  ],
  "skills": [
   "ar.mul20"
  ]
 },
 {
  "id": "multiply-by-9",
  "title": "×9 is ×10 minus the number",
  "rule": "Append a zero and subtract the original number.",
  "example": "47 × 9: 470 − 47 = 423",
  "when": "Multiplying by 9, 90, or 0.9.",
  "tags": [
   "multiply-by-9",
   "compensation",
   "subtraction"
  ],
  "skills": [
   "ar.mul12",
   "coef.mul"
  ]
 },
 {
  "id": "multiply-by-99",
  "title": "×99 is ×100 minus the number",
  "rule": "Append two zeros and subtract the original number; same idea for ×98 (subtract twice).",
  "example": "37 × 99: 3700 − 37 = 3663",
  "when": "Multiplying by 99, 98, 999, or 0.99.",
  "tags": [
   "near-multiple-of-ten",
   "compensation",
   "subtraction"
  ],
  "skills": [
   "ar.near100",
   "ar.short11"
  ]
 },
 {
  "id": "square-ending-in-5",
  "title": "Squares ending in 5",
  "rule": "Multiply the tens digit by the next integer up and append 25.",
  "example": "65²: 6×7 = 42 → 4225",
  "when": "Squaring any number ending in 5 (also 1.5², 0.5², 105², etc.).",
  "tags": [
   "squares-ending-5",
   "squares"
  ],
  "skills": [
   "ar.sq12",
   "ar.sq25"
  ]
 },
 {
  "id": "square-near-50",
  "title": "Squares near 50",
  "rule": "For 50 ± d, the square is 2500 ± 100d + d².",
  "example": "53²: 2500 + 300 + 9 = 2809; 47²: 2500 − 300 + 9 = 2209",
  "when": "Squaring numbers between about 40 and 60.",
  "tags": [
   "squares-near-50",
   "squares",
   "compensation"
  ],
  "skills": [
   "ar.sq25"
  ]
 },
 {
  "id": "square-near-100",
  "title": "Squares near 100",
  "rule": "For 100 ± d, add or subtract d to get the leading part, then append d² as two digits.",
  "example": "96²: 96−4 = 92, 4² = 16 → 9216; 104²: 108 | 16 → 10816",
  "when": "Squaring numbers between about 90 and 110.",
  "tags": [
   "near-multiple-of-ten",
   "squares",
   "compensation"
  ],
  "skills": [
   "ar.sq25",
   "ar.near100"
  ]
 },
 {
  "id": "square-any-two-digit",
  "title": "Square via a round neighbor",
  "rule": "Move d to the nearest round number both ways, multiply the two, and add d²: n² = (n+d)(n−d) + d².",
  "example": "23²: 26×20 + 3² = 520 + 9 = 529",
  "when": "Squaring any two-digit number not covered by a special pattern (Benjamin's method).",
  "tags": [
   "squares",
   "difference-of-squares",
   "near-multiple-of-ten"
  ],
  "skills": [
   "ar.sq25"
  ]
 },
 {
  "id": "double-and-halve",
  "title": "Double one factor, halve the other",
  "rule": "Halve an even factor and double the other until the product is easy; the product is unchanged.",
  "example": "16 × 35: 8 × 70 = 560",
  "when": "One factor is even and the other ends in 5 or is near a round number.",
  "tags": [
   "halving",
   "doubling"
  ],
  "skills": [
   "ar.double"
  ]
 },
 {
  "id": "multiply-by-4-and-8",
  "title": "×4 and ×8 by repeated doubling",
  "rule": "Double twice for ×4, three times for ×8.",
  "example": "27 × 8: 54 → 108 → 216",
  "when": "Multiplying by any power of 2; also ×16, ×32.",
  "tags": [
   "doubling",
   "mul-facts"
  ],
  "skills": [
   "ar.mul12",
   "ar.split"
  ]
 },
 {
  "id": "divide-by-5",
  "title": "÷5 is ×2 then ÷10",
  "rule": "Double the number and move the decimal one place left.",
  "example": "235 ÷ 5: 470 → 47",
  "when": "Dividing by 5, 50, or 0.5.",
  "tags": [
   "div-facts",
   "doubling",
   "decimal-shift"
  ],
  "skills": [
   "ar.div1",
   "ar.divfacts"
  ]
 },
 {
  "id": "divide-by-25",
  "title": "÷25 is ×4 then ÷100",
  "rule": "Multiply by 4 and move the decimal two places left.",
  "example": "350 ÷ 25: 1400 → 14",
  "when": "Dividing by 25 or 2.5.",
  "tags": [
   "div-facts",
   "doubling",
   "decimal-shift",
   "multiply-by-25"
  ],
  "skills": [
   "ar.div1"
  ]
 },
 {
  "id": "divide-by-4-and-8",
  "title": "÷4 and ÷8 by repeated halving",
  "rule": "Halve twice for ÷4, three times for ÷8.",
  "example": "616 ÷ 8: 308 → 154 → 77",
  "when": "Dividing by a power of 2, especially when the number is even.",
  "tags": [
   "halving",
   "div-facts"
  ],
  "skills": [
   "ar.div1"
  ]
 },
 {
  "id": "divide-by-cancelling-factors",
  "title": "Cancel common factors before dividing",
  "rule": "Divide both numbers by an obvious shared factor first, then finish the smaller division.",
  "example": "1440 ÷ 36: both ÷4 → 360 ÷ 9 = 40",
  "when": "Divisor and dividend share a visible factor (2, 3, 4, 5, 10).",
  "tags": [
   "common-factor",
   "div-facts",
   "halving"
  ],
  "skills": [
   "ar.div1",
   "fr.simplify"
  ]
 },
 {
  "id": "divisibility-2-4-8",
  "title": "Divisibility by 2, 4, 8",
  "rule": "Check the last digit for 2, the last two digits for 4, and the last three digits for 8.",
  "example": "5,128: last three digits 128 = 8×16 → divisible by 8 (and 4 and 2)",
  "when": "Testing evenness or factoring out powers of 2.",
  "tags": [
   "divisibility"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "divisibility-3-9",
  "title": "Divisibility by 3 and 9 via digit sum",
  "rule": "Add the digits; if the sum is divisible by 3 (or 9), so is the number.",
  "example": "4,527: 4+5+2+7 = 18 → divisible by 9 (4527 = 9 × 503)",
  "when": "Simplifying fractions or factoring quickly.",
  "tags": [
   "divisibility"
  ],
  "skills": [
   "ar.rem",
   "fr.simplify"
  ]
 },
 {
  "id": "divisibility-6-12",
  "title": "Divisibility by 6 and 12 as combined tests",
  "rule": "A number is divisible by 6 if it passes both the 2 and 3 tests, and by 12 if it passes both the 3 and 4 tests.",
  "example": "1,116: digit sum 9 (÷3 ok), last two digits 16 (÷4 ok) → divisible by 12 (= 93 × 12)",
  "when": "Testing composite divisors: split into coprime factors and test each.",
  "tags": [
   "divisibility",
   "common-factor"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "divisibility-5-10",
  "title": "Divisibility by 5 and 10",
  "rule": "Ends in 0 or 5 for 5; ends in 0 for 10; ends in 00 for 100.",
  "example": "3,485 ends in 5 → divisible by 5 (= 697 × 5)",
  "when": "Instant check when scanning answer choices.",
  "tags": [
   "divisibility",
   "powers-of-ten"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "divisibility-7",
  "title": "Divisibility by 7: double last digit, subtract",
  "rule": "Remove the last digit, double it, subtract from the remaining number; repeat until the result is small, and check if it is a multiple of 7 (including 0).",
  "example": "343: 34 − 2×3 = 28 = 4×7 → divisible by 7",
  "when": "Testing for 7 when no factorization is obvious.",
  "tags": [
   "divisibility"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "divisibility-11",
  "title": "Divisibility by 11 via alternating sum",
  "rule": "Alternately subtract and add the digits; if the result is 0 or a multiple of 11, the number is divisible by 11.",
  "example": "2,728: 2 − 7 + 2 − 8 = −11 → divisible by 11 (= 248 × 11)",
  "when": "Testing for 11 in factoring or remainder problems.",
  "tags": [
   "divisibility",
   "multiply-by-11"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "remainder-mod-9-digit-sum",
  "title": "Remainder mod 9 (or 3) from digit sum",
  "rule": "The remainder when dividing by 9 equals the remainder of the digit sum divided by 9; same for 3.",
  "example": "4,532: digit sum 14 → 14 mod 9 = 5, so 4532 = 9×503 + 5; and 14 mod 3 = 2",
  "when": "Remainder questions with divisor 3 or 9.",
  "tags": [
   "divisibility",
   "div-facts"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "remainder-from-last-digits",
  "title": "Remainder mod 4, 25, 8 from last digits",
  "rule": "The remainder mod 4 or 25 depends only on the last two digits; mod 8 or 125 only on the last three.",
  "example": "7,318 mod 4: 18 mod 4 = 2",
  "when": "Divisor is a factor of 100 or 1000.",
  "tags": [
   "divisibility",
   "powers-of-ten"
  ],
  "skills": [
   "ar.rem"
  ]
 },
 {
  "id": "casting-out-nines-check",
  "title": "Check a product by casting out nines",
  "rule": "Reduce each factor to its digit sum mod 9, multiply, and compare with the digit sum of the answer; a mismatch means an error.",
  "example": "47 × 23 = 1081: 47→2, 23→5, 2×5 = 10→1; 1081→10→1 ✓",
  "when": "Verifying a long multiplication or addition quickly.",
  "tags": [
   "divisibility",
   "estimation"
  ],
  "skills": [
   "ar.split",
   "ar.mul20"
  ]
 },
 {
  "id": "simplify-common-factor",
  "title": "Simplify by pulling common factors",
  "rule": "Test both numerator and denominator against the same small primes (2, 3, 5, 7, 11) and divide out each shared factor.",
  "example": "84/126: both ÷2 → 42/63, both ÷21 → 2/3",
  "when": "Any fraction reduction before further arithmetic.",
  "tags": [
   "common-factor",
   "divisibility"
  ],
  "skills": [
   "fr.simplify",
   "fr.add"
  ]
 },
 {
  "id": "simplify-difference-test",
  "title": "GCD divides the difference",
  "rule": "Any common factor of numerator and denominator also divides their difference; test factors of the difference.",
  "example": "91/104: difference 13; 91 = 7×13, 104 = 8×13 → 7/8",
  "when": "Numerator and denominator are close together and no factor is obvious.",
  "tags": [
   "common-factor",
   "divisibility",
   "subtraction"
  ],
  "skills": [
   "fr.simplify"
  ]
 },
 {
  "id": "cross-multiply-compare",
  "title": "Compare fractions by cross-multiplying",
  "rule": "Compare a/b and c/d by comparing a×d with c×b; the bigger product belongs to the bigger fraction.",
  "example": "5/8 vs 7/11: 5×11 = 55, 7×8 = 56 → 7/11 is larger",
  "when": "Two fractions with different numerators and denominators.",
  "tags": [
   "cross-multiply-compare",
   "fraction-magnitude"
  ],
  "skills": [
   "fr.compare"
  ]
 },
 {
  "id": "benchmark-half",
  "title": "Compare fractions against ½ (or ⅓, 1)",
  "rule": "Decide which side of ½ each fraction falls on by doubling the numerator and comparing to the denominator.",
  "example": "7/15 vs 9/17: 14 < 15 so 7/15 < ½; 18 > 17 so 9/17 > ½ → 9/17 larger",
  "when": "Fractions that straddle a familiar benchmark.",
  "tags": [
   "benchmark-fractions",
   "fraction-magnitude"
  ],
  "skills": [
   "fr.compare"
  ]
 },
 {
  "id": "same-numerator-compare",
  "title": "Same numerator: smaller denominator wins",
  "rule": "With equal numerators, the fraction with the smaller denominator is larger; scale numerators to match when they are close.",
  "example": "3/7 vs 3/8: 3/7 is larger; 2/5 vs 4/11: 4/10 vs 4/11 → 2/5 larger",
  "when": "Numerators are equal or one is a small multiple of the other.",
  "tags": [
   "fraction-magnitude",
   "benchmark-fractions",
   "scale-by-numerator"
  ],
  "skills": [
   "fr.compare"
  ]
 },
 {
  "id": "distance-from-one",
  "title": "Compare by distance from 1",
  "rule": "For fractions just below 1, compare the gaps 1 − a/b; the smaller gap is the larger fraction.",
  "example": "7/8 vs 8/9: gaps 1/8 and 1/9; 1/9 is smaller → 8/9 is larger",
  "when": "Both fractions have numerator one (or the same amount) less than the denominator.",
  "tags": [
   "fraction-magnitude",
   "benchmark-fractions",
   "subtraction"
  ],
  "skills": [
   "fr.compare"
  ]
 },
 {
  "id": "eighths-to-decimal",
  "title": "Know the eighths",
  "rule": "Memorize 1/8 = 0.125 and step by 0.125: 3/8 = 0.375, 5/8 = 0.625, 7/8 = 0.875.",
  "example": "5/8 of 400: 0.625 × 400 = 250",
  "when": "Any fraction, decimal, or percent with denominator 8 (12.5%, 37.5%, 62.5%, 87.5%).",
  "tags": [
   "fraction-decimal",
   "unit-fraction-percent"
  ],
  "skills": [
   "fr.todec",
   "fr.fromdec",
   "fr.common",
   "fr.unit"
  ]
 },
 {
  "id": "twelfths-to-decimal",
  "title": "Know the twelfths",
  "rule": "1/12 = 0.08333; the odd twelfths are 5/12 ≈ 0.4167, 7/12 ≈ 0.5833, 11/12 ≈ 0.9167 (even ones reduce to sixths, quarters, thirds).",
  "example": "7/12 ≈ 0.5833, so 7/12 of 240 = 140",
  "when": "Problems in months per year or dozens.",
  "tags": [
   "fraction-decimal",
   "scale-by-numerator"
  ],
  "skills": [
   "fr.todec",
   "fr.unit",
   "fr.common"
  ]
 },
 {
  "id": "sixteenths-to-decimal",
  "title": "Know the sixteenths",
  "rule": "1/16 = 0.0625; multiply by the numerator: 3/16 = 0.1875, 5/16 = 0.3125, 15/16 = 0.9375.",
  "example": "3/16 = 3 × 0.0625 = 0.1875 = 18.75%",
  "when": "Halving an eighth, or working in sixteenths of an inch.",
  "tags": [
   "fraction-decimal",
   "halving",
   "scale-by-numerator"
  ],
  "skills": [
   "fr.todec",
   "fr.unit"
  ]
 },
 {
  "id": "sevenths-cycle",
  "title": "Sevenths repeat 142857",
  "rule": "Every seventh is a rotation of 0.142857…; pick the rotation starting with the right leading digit (1/7 starts 14, 2/7 starts 28, 3/7 starts 42, 4/7 starts 57, 5/7 starts 71, 6/7 starts 85).",
  "example": "3/7 = 0.428571…, 5/7 = 0.714285…",
  "when": "Converting sevenths to decimals or percents (≈14.3% per seventh).",
  "tags": [
   "fraction-decimal",
   "unit-fraction-percent"
  ],
  "skills": [
   "fr.todec",
   "fr.unit",
   "fr.common"
  ]
 },
 {
  "id": "ninths-elevenths",
  "title": "Ninths and elevenths repeat",
  "rule": "n/9 = 0.nnn… and n/11 = 0.(9n)(9n)… as a two-digit repeating block.",
  "example": "4/9 = 0.444…; 3/11 = 0.2727… (since 3×9 = 27)",
  "when": "Converting repeating decimals to fractions and back.",
  "tags": [
   "fraction-decimal",
   "multiply-by-9",
   "multiply-by-11"
  ],
  "skills": [
   "fr.todec",
   "fr.fromdec",
   "fr.unit"
  ]
 },
 {
  "id": "thirds-and-sixths",
  "title": "Thirds and sixths as percents",
  "rule": "1/3 ≈ 33.3%, 2/3 ≈ 66.7%, 1/6 ≈ 16.7%, 5/6 ≈ 83.3%.",
  "example": "5/6 of 90 = 75 (≈83.3% of 90)",
  "when": "Fractions with denominator 3 or 6.",
  "tags": [
   "fraction-decimal",
   "unit-fraction-percent",
   "benchmark-fractions"
  ],
  "skills": [
   "fr.unit",
   "fr.common",
   "fr.todec"
  ]
 },
 {
  "id": "percent-anchors",
  "title": "Build percents from 10%, 5%, 1%",
  "rule": "Find 10% by shifting the decimal, 5% by halving it, 1% by shifting twice, then add pieces.",
  "example": "17% of 240: 10% = 24, 5% = 12, 1% = 2.4 twice = 4.8 → 40.8",
  "when": "Any percent of a number that is not a simple fraction.",
  "tags": [
   "percent-anchor",
   "percent-compose",
   "decimal-shift"
  ],
  "skills": [
   "pct.anchor",
   "pct.compose",
   "co.pctbig"
  ]
 },
 {
  "id": "percent-swap",
  "title": "x% of y equals y% of x",
  "rule": "Swap the two numbers when the percent is awkward but the base is a nice percent.",
  "example": "8% of 25 = 25% of 8 = 2",
  "when": "The base number is 25, 50, 20, 10 or another easy percent.",
  "tags": [
   "percent-anchor",
   "unit-fraction-percent"
  ],
  "skills": [
   "pct.compose",
   "pct.anchor"
  ]
 },
 {
  "id": "unit-fraction-percents",
  "title": "Percents that are unit fractions",
  "rule": "Replace the percent by its fraction: 12.5% = 1/8, 20% = 1/5, 25% = 1/4, 33.3% = 1/3, 16.7% = 1/6, 14.3% ≈ 1/7, 11.1% = 1/9.",
  "example": "12.5% of 640 = 640/8 = 80; 37.5% of 640 = 3 × 80 = 240",
  "when": "The percent matches a simple fraction of the base.",
  "tags": [
   "unit-fraction-percent",
   "scale-by-numerator",
   "halving"
  ],
  "skills": [
   "pct.compose",
   "fr.of",
   "co.fracsci"
  ]
 },
 {
  "id": "percent-by-subtraction",
  "title": "Percent by subtracting from 100%",
  "rule": "For percents near 100, take the whole and subtract the small complement.",
  "example": "95% of 360: 360 − 5% (18) = 342",
  "when": "Percent is 90–99% or a fraction like 7/8.",
  "tags": [
   "percent-compose",
   "compensation",
   "subtraction"
  ],
  "skills": [
   "pct.compose",
   "pct.apply"
  ]
 },
 {
  "id": "percent-change-multiplier",
  "title": "Percent change as a single multiplier",
  "rule": "Increase by p% is ×(1 + p/100); decrease is ×(1 − p/100). Compute the multiplier first.",
  "example": "80 up 15%: 80 × 1.15 = 80 + 12 = 92",
  "when": "Any single percent increase or decrease.",
  "tags": [
   "percent-change",
   "percent-compose"
  ],
  "skills": [
   "pct.apply",
   "co.chainbig"
  ]
 },
 {
  "id": "reverse-percent-divide",
  "title": "Undo a percent change by dividing",
  "rule": "To recover the original, divide by the multiplier; never apply the opposite percent.",
  "example": "Sale price 64 after 20% off: 64 ÷ 0.8 = 80 (not 64 × 1.2 = 76.8)",
  "when": "You know the result and the percent and need the starting value.",
  "tags": [
   "percent-reverse",
   "percent-change"
  ],
  "skills": [
   "pct.reverse"
  ]
 },
 {
  "id": "percent-change-formula",
  "title": "Percent change is change over original",
  "rule": "Divide the difference by the original (starting) value, not the new one.",
  "example": "60 → 75: 15/60 = 25% increase; 75 → 60 is 15/75 = 20% decrease",
  "when": "Any 'what percent more/less' question.",
  "tags": [
   "percent-change",
   "ratio-to-percent"
  ],
  "skills": [
   "pct.find",
   "pct.what"
  ]
 },
 {
  "id": "successive-changes-multiply",
  "title": "Successive changes multiply",
  "rule": "Chain percent changes by multiplying their multipliers; they never simply add or cancel.",
  "example": "Up 20% then down 20%: 1.2 × 0.8 = 0.96 → net 4% decrease",
  "when": "Two or more sequential percent changes on the same quantity.",
  "tags": [
   "successive-change",
   "percent-change"
  ],
  "skills": [
   "pct.chain",
   "co.chainbig"
  ]
 },
 {
  "id": "two-increases-shortcut",
  "title": "Two changes: a + b + ab/100",
  "rule": "Combined percent change for a% then b% is a + b + ab/100 (signs included).",
  "example": "+10% then +10%: 10 + 10 + 1 = 21%; +30% then −20%: 30 − 20 − 6 = +4%",
  "when": "Exactly two successive changes and you want the net percent directly.",
  "tags": [
   "successive-change",
   "percent-compose"
  ],
  "skills": [
   "pct.chain",
   "co.chainbig"
  ]
 },
 {
  "id": "percent-of-percent",
  "title": "Percent of a percent",
  "rule": "Multiply the two percents as decimals (or fractions).",
  "example": "40% of 25% = 0.4 × 0.25 = 0.10 = 10%; 50% of 50% = 25%",
  "when": "Nested percentages (a share of a share).",
  "tags": [
   "percent-of-percent",
   "successive-change"
  ],
  "skills": [
   "pct.chain"
  ]
 },
 {
  "id": "ratio-to-percent",
  "title": "Ratio parts to percent of the whole",
  "rule": "Add the ratio parts for the whole; each part's percent is part/whole.",
  "example": "3:5 → whole 8 → 3/8 = 37.5% and 5/8 = 62.5%",
  "when": "Converting part-to-part ratios into shares of the total.",
  "tags": [
   "ratio-to-percent",
   "fraction-decimal"
  ],
  "skills": [
   "pct.what"
  ]
 },
 {
  "id": "rule-of-72",
  "title": "Rule of 72 for doubling time",
  "rule": "Years to double ≈ 72 ÷ annual growth rate (in percent); flip it to get the rate for a given doubling time.",
  "example": "6% per year doubles in about 72/6 = 12 years; doubling in 9 years needs about 8%",
  "when": "Compound growth, investments, inflation, population.",
  "tags": [
   "rule-of-72",
   "estimation"
  ],
  "skills": [
   "co.double",
   "co.growth"
  ]
 },
 {
  "id": "small-rate-approximation",
  "title": "(1+r)^n ≈ 1 + nr for small r",
  "rule": "For small rates, approximate compound growth as simple growth; add n(n−1)/2 × r² for a second-order correction.",
  "example": "1.02^5 ≈ 1 + 0.10 = 1.10; correction 10 × 0.0004 = 0.004 → 1.104 (exact 1.1041)",
  "when": "Rate under ~5% and few periods; also for estimating small compounded discounts.",
  "tags": [
   "estimation",
   "percent-compose",
   "successive-change"
  ],
  "skills": [
   "co.growth"
  ]
 },
 {
  "id": "sci-notation-multiply",
  "title": "Multiply mantissas, add exponents",
  "rule": "Multiply the leading numbers, add the powers of ten, then renormalize so the mantissa is between 1 and 10.",
  "example": "(3×10⁴)(4×10⁵) = 12×10⁹ = 1.2×10¹⁰",
  "when": "Products of large or small numbers in scientific notation.",
  "tags": [
   "exponent-add",
   "normalize",
   "powers-of-ten"
  ],
  "skills": [
   "sn.mul",
   "mag.mul"
  ]
 },
 {
  "id": "sci-notation-divide",
  "title": "Divide mantissas, subtract exponents",
  "rule": "Divide the leading numbers and subtract the exponents; borrow a power of ten if the mantissa division is awkward.",
  "example": "(8×10⁷)/(2×10³) = 4×10⁴; (2×10⁷)/(8×10³) = (20×10⁶)/(8×10³) = 2.5×10³",
  "when": "Quotients in scientific notation or unit conversions.",
  "tags": [
   "exponent-subtract",
   "normalize",
   "powers-of-ten"
  ],
  "skills": [
   "sn.div",
   "mag.div",
   "co.percap"
  ]
 },
 {
  "id": "sci-notation-sqrt",
  "title": "Square root: halve the exponent",
  "rule": "Make the exponent even by shifting the mantissa, then take the root of the mantissa and halve the exponent.",
  "example": "√(2.5×10⁷) = √(25×10⁶) = 5×10³",
  "when": "Square roots of numbers in scientific notation, or estimating √ of large numbers.",
  "tags": [
   "normalize",
   "squares",
   "powers-of-ten",
   "exponent-subtract"
  ],
  "skills": [
   "sn.norm"
  ]
 },
 {
  "id": "scale-words-exponents",
  "title": "Thousand, million, billion as exponents",
  "rule": "thousand = 10³, million = 10⁶, billion = 10⁹, trillion = 10¹²; multiply scale words by adding exponents.",
  "example": "2 million × 3 thousand = 6×10⁹ = 6 billion; 1 billion ÷ 1 million = 1,000",
  "when": "Fermi estimates and any calculation quoted in words.",
  "tags": [
   "scale-words",
   "exponent-add",
   "powers-of-ten"
  ],
  "skills": [
   "sn.words",
   "mag.mul",
   "mag.div",
   "co.compare",
   "co.pctbig",
   "co.fracsci"
  ]
 },
 {
  "id": "round-both-ways",
  "title": "Round factors in opposite directions",
  "rule": "Round one factor up and the other down so the errors partly cancel; note the direction of the remaining bias.",
  "example": "48 × 52 ≈ 50 × 50 = 2500 (exact 2496); 62 × 38 ≈ 60 × 40 = 2400 (exact 2356)",
  "when": "A quick estimate is enough, or to sanity-check an exact answer.",
  "tags": [
   "rounding",
   "estimation",
   "difference-of-squares"
  ],
  "skills": [
   "mag.mul",
   "dec.round"
  ]
 },
 {
  "id": "round-then-compensate",
  "title": "Round one factor, then correct exactly",
  "rule": "Round a factor to a nearby round number, multiply, then subtract or add the rounding error times the other factor.",
  "example": "19 × 31: 20 × 31 = 620, minus 1 × 31 → 589",
  "when": "One factor is within 1–3 of a multiple of ten and an exact answer is needed.",
  "tags": [
   "rounding",
   "compensation",
   "near-multiple-of-ten"
  ],
  "skills": [
   "ar.split",
   "ar.near100"
  ]
 },
 {
  "id": "add-left-to-right",
  "title": "Add left to right by place",
  "rule": "Add the hundreds, then tens, then ones, keeping a running total (Benjamin's method).",
  "example": "478 + 256: 400+200 = 600, 70+50 = 120 → 720, 8+6 = 14 → 734",
  "when": "Any multi-digit addition done in your head.",
  "tags": [
   "add-partials"
  ],
  "skills": [
   "dec.ops"
  ]
 },
 {
  "id": "subtract-by-adding-up",
  "title": "Subtract by counting up",
  "rule": "Start at the smaller number and add convenient jumps to reach the larger; the jumps sum to the difference.",
  "example": "1000 − 387: 387 + 13 = 400, + 600 = 1000 → 613",
  "when": "Subtracting from a round number, making change, elapsed-time problems.",
  "tags": [
   "subtraction",
   "add-partials",
   "compensation"
  ],
  "skills": [
   "dec.ops"
  ]
 },
 {
  "id": "complement-subtraction",
  "title": "Complements for subtracting from powers of ten",
  "rule": "Subtract every digit from 9 and the last digit from 10.",
  "example": "1000 − 387: 9−3, 9−8, 10−7 → 613",
  "when": "Subtracting from 100, 1000, 10000 (Vedic 'all from 9, last from 10').",
  "tags": [
   "subtraction",
   "powers-of-ten",
   "near-multiple-of-ten"
  ],
  "skills": [
   "dec.ops"
  ]
 },
 {
  "id": "subtract-round-subtrahend",
  "title": "Round the subtrahend, then adjust",
  "rule": "Subtract a nearby round number, then add back (or take off) the rounding difference.",
  "example": "534 − 298: 534 − 300 = 234, + 2 → 236",
  "when": "The number being subtracted ends in 7, 8, or 9.",
  "tags": [
   "subtraction",
   "compensation",
   "near-multiple-of-ten"
  ],
  "skills": [
   "dec.ops"
  ]
 },
 {
  "id": "unit-price-compare",
  "title": "Compare by unit price",
  "rule": "Divide price by quantity for each option (or scale both to a common quantity) and compare.",
  "example": "12 for $4.80 → $0.40 each; 3 for $2.10 → $0.70 each; the dozen is cheaper",
  "when": "Shopping, rate comparisons, and 'best value' questions.",
  "tags": [
   "unit-price",
   "div-facts",
   "normalize"
  ],
  "skills": [
   "co.unitprice"
  ]
 },
 {
  "id": "common-denominator-add",
  "title": "Add fractions via LCM, not product",
  "rule": "Use the least common multiple of the denominators as the common denominator so the numbers stay small.",
  "example": "5/6 + 3/4: LCM 12 → 10/12 + 9/12 = 19/12 = 1 7/12",
  "when": "Adding or subtracting fractions whose denominators share a factor.",
  "tags": [
   "common-denominator",
   "common-factor"
  ],
  "skills": [
   "fr.add"
  ]
 }
];
