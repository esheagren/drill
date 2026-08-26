export function parseNumberInput(input: string): number | null {
  if (!input.trim()) return null;
  
  let normalized = input.trim().toLowerCase().replace(/,/g, "");
  
  const wordMultipliers: Record<string, number> = {
    thousand: 1e3,
    k: 1e3,
    million: 1e6,
    m: 1e6,
    billion: 1e9,
    b: 1e9,
    trillion: 1e12,
    t: 1e12,
  };
  
  for (const [word, multiplier] of Object.entries(wordMultipliers)) {
    if (normalized.includes(word)) {
      const numPart = normalized.replace(word, "").trim();
      const num = parseFloat(numPart || "1");
      if (!isNaN(num)) {
        return num * multiplier;
      }
    }
  }
  
  if (normalized.includes("e")) {
    const num = parseFloat(normalized);
    if (!isNaN(num)) return num;
  }
  
  if (normalized.includes("^")) {
    const parts = normalized.split(/[×x*]/);
    if (parts.length === 2) {
      const coefficient = parseFloat(parts[0]);
      const expMatch = parts[1].match(/10\s*\^\s*(-?\d+)/);
      if (!isNaN(coefficient) && expMatch) {
        const exponent = parseInt(expMatch[1]);
        return coefficient * Math.pow(10, exponent);
      }
    }
  }
  
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

export function formatNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(2);
}

export function toScientific(n: number): { coefficient: number; exponent: number } {
  if (n === 0) return { coefficient: 0, exponent: 0 };
  const exponent = Math.floor(Math.log10(Math.abs(n)));
  const coefficient = n / Math.pow(10, exponent);
  return { coefficient, exponent };
}

export function formatScientific(n: number): string {
  const { coefficient, exponent } = toScientific(n);
  return `${coefficient.toFixed(1)} × 10^${exponent}`;
}

export function calculateMagnitudeError(userAnswer: number, correct: number): number {
  if (correct === 0) return Infinity;
  return Math.abs(Math.log10(Math.abs(userAnswer)) - Math.log10(Math.abs(correct)));
}

export function calculateAccuracy(userAnswer: number, correct: number): number {
  if (correct === 0) return userAnswer === 0 ? 1 : 0;
  const error = Math.abs((userAnswer - correct) / correct);
  return Math.max(0, 1 - error);
}
