import { calculateCalories } from './calorieUtils';

/**
 * Escapes a field for CSV according to RFC 4180
 * @param {string|number} value 
 * @returns {string}
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If field contains quotes, commas, or newlines, enclose in double quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports a list of workouts to a CSV file and triggers browser download
 * @param {Array} workouts - List of workout objects
 * @param {string} [filename] - Custom file name
 */
export function exportToCSV(workouts = [], filename) {
  if (!workouts || workouts.length === 0) {
    alert('No workouts available to export.');
    return;
  }

  const defaultFilename = `fitness_workouts_${new Date().toISOString().split('T')[0]}.csv`;
  const name = filename || defaultFilename;

  const headers = [
    'Date Logged',
    'Exercise Type',
    'Duration (Minutes)',
    'Est. Calories Burned (kcal)',
    'Intensity',
    'Notes'
  ];

  const rows = workouts.map(w => {
    const date = (w.date_logged || '').split('T')[0];
    const exercise = w.exercise_type || '';
    const duration = w.duration_minutes || 0;
    const calories = calculateCalories(exercise, duration);
    const intensity = (w.intensity || 'medium').toUpperCase();
    const notes = w.notes || '';

    return [
      escapeCSVField(date),
      escapeCSVField(exercise),
      duration,
      calories,
      escapeCSVField(intensity),
      escapeCSVField(notes)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  triggerDownload(blob, name);
}

/**
 * Exports a list of workouts to a formatted JSON file and triggers browser download
 * @param {Array} workouts - List of workout objects
 * @param {string} [filename] - Custom file name
 */
export function exportToJSON(workouts = [], filename) {
  if (!workouts || workouts.length === 0) {
    alert('No workouts available to export.');
    return;
  }

  const defaultFilename = `fitness_workouts_${new Date().toISOString().split('T')[0]}.json`;
  const name = filename || defaultFilename;

  const enrichedData = workouts.map(w => ({
    id: w.id,
    date_logged: (w.date_logged || '').split('T')[0],
    exercise_type: w.exercise_type,
    duration_minutes: Number(w.duration_minutes),
    estimated_calories_burned: calculateCalories(w.exercise_type, w.duration_minutes),
    intensity: w.intensity || 'medium',
    notes: w.notes || null
  }));

  const exportPayload = {
    exported_at: new Date().toISOString(),
    total_records: enrichedData.length,
    workouts: enrichedData
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  triggerDownload(blob, name);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
