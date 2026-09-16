// Sports-science standard MET (Metabolic Equivalent of Task) calorie burn estimates
// Based on an average body weight of ~70kg (154 lbs)

const MET_RATES = {
  running: 11.5,
  run: 11.5,
  sprint: 14.0,
  'weight training': 6.5,
  weights: 6.5,
  gym: 6.5,
  lifting: 6.5,
  cycling: 8.5,
  biking: 8.5,
  swimming: 9.0,
  swim: 9.0,
  yoga: 3.5,
  pilates: 4.0,
  walking: 4.0,
  walk: 4.0,
  hiit: 10.5,
  rowing: 9.0,
  default: 6.0
};

/**
 * Calculates estimated calories burned for a given exercise and duration
 * @param {string} exerciseType - Name of the exercise
 * @param {number|string} durationMinutes - Duration in minutes
 * @returns {number} Estimated calories burned
 */
export function calculateCalories(exerciseType = '', durationMinutes = 0) {
  const duration = Number(durationMinutes) || 0;
  if (duration <= 0) return 0;

  const normalized = (exerciseType || '').toLowerCase().trim();
  
  // Find matching rate
  let rate = MET_RATES.default;
  for (const [key, val] of Object.entries(MET_RATES)) {
    if (key !== 'default' && normalized.includes(key)) {
      rate = val;
      break;
    }
  }

  return Math.round(duration * rate);
}

/**
 * Calculates total estimated calories burned across a list of workouts
 * @param {Array} workouts - List of workout objects
 * @returns {number} Total estimated calories burned
 */
export function calculateTotalCalories(workouts = []) {
  if (!Array.isArray(workouts)) return 0;
  return workouts.reduce((total, w) => {
    return total + calculateCalories(w.exercise_type, w.duration_minutes);
  }, 0);
}
