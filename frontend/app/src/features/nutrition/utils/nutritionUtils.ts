// ─── Nutrition Utility Functions ──────────────────────────────────────────────

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMICategoryColor(category: string): string {
  switch (category) {
    case 'Normal': return '#31D67B';
    case 'Underweight': return '#2F80FF';
    case 'Overweight': return '#FFC542';
    case 'Obese': return '#FF4757';
    default: return '#7C4DFF';
  }
}

export function formatCalories(cal: number): string {
  if (cal >= 1000) return `${(cal / 1000).toFixed(1)}k`;
  return String(Math.round(cal));
}

export function getMacroPercentage(consumed: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((consumed / goal) * 100), 100);
}

export function getHydrationPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

export function formatMillilitres(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`;
  return `${ml}ml`;
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return `$${amount.toFixed(2)}`;
}

export function getCaloriesRemaining(consumed: number, goal: number): number {
  return Math.max(goal - consumed, 0);
}

export function getCalorieProgress(consumed: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(consumed / goal, 1);
}

export function formatMealType(mealType: string): string {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

export function getBudgetPercentage(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Math.min(Math.round((spent / budget) * 100), 100);
}

export function getShoppingProgress(checkedCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((checkedCount / total) * 100);
}

export function getMacroColor(macro: 'protein' | 'carbs' | 'fat'): string {
  switch (macro) {
    case 'protein': return '#7C4DFF';
    case 'carbs': return '#2F80FF';
    case 'fat': return '#FFC542';
  }
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Convert a percentage (0-100) to SVG arc path for a circular ring.
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = degreesToRadians(angleDeg - 90);
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}
