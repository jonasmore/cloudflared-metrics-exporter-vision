export type ChartType = 'line' | 'bar' | 'scatter' | 'table';
export type ChartViewMode = 'cumulative' | 'delta';

export interface ChartSettings {
  chartType: ChartType;
  viewMode: ChartViewMode;
}

const STORAGE_KEY = 'metric-chart-settings';

/**
 * Get chart settings from local storage
 */
export function getChartSettings(metricName: string): ChartSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allSettings = JSON.parse(stored);
      if (allSettings[metricName]) {
        return allSettings[metricName];
      }
    }
  } catch (error) {
    console.error('Failed to load chart settings:', error);
  }
  
  // Default settings
  return {
    chartType: 'line',
    viewMode: 'cumulative',
  };
}

/**
 * Save chart settings to local storage
 */
export function saveChartSettings(metricName: string, settings: ChartSettings): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allSettings = stored ? JSON.parse(stored) : {};
    allSettings[metricName] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Failed to save chart settings:', error);
  }
}

/**
 * Calculate delta values from cumulative counter data
 */
export function calculateDelta(data: { timestamp: Date; value: number }[]): { timestamp: Date; value: number }[] {
  if (data.length <= 1) return data;
  
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const delta = Math.max(0, data[i].value - data[i - 1].value);
    result.push({
      timestamp: data[i].timestamp,
      value: delta,
    });
  }
  
  return result;
}
