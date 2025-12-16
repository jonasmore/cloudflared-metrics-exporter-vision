import { MetricSample, MetricSeries, ParsedMetrics, MetricGroup } from '@/types/metrics';

/**
 * Parse JSONL file content into structured metrics
 */
export function parseJSONL(content: string): ParsedMetrics {
  const lines = content.trim().split('\n');
  const samples: MetricSample[] = [];
  
  // Parse each line as JSON
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const sample = JSON.parse(line) as MetricSample;
      samples.push(sample);
    } catch (error) {
      console.error('Failed to parse line:', line, error);
    }
  }

  if (samples.length === 0) {
    throw new Error('No valid metrics found in file');
  }

  // Group metrics by name and labels
  const seriesMap = new Map<string, MetricSeries>();
  
  for (const sample of samples) {
    const seriesKey = getSeriesKey(sample.name, sample.labels);
    
    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, {
        name: sample.name,
        type: sample.type,
        labels: sample.labels,
        data: [],
      });
    }
    
    const series = seriesMap.get(seriesKey)!;
    series.data.push({
      timestamp: new Date(sample.timestamp),
      value: sample.value,
    });
  }

  // Sort data points by timestamp
  for (const series of seriesMap.values()) {
    series.data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Categorize metrics into groups
  const groups = categorizeMetrics(Array.from(seriesMap.values()));

  // Calculate time range (avoid spread operator for large arrays)
  let minTime = Infinity;
  let maxTime = -Infinity;
  
  for (const sample of samples) {
    const time = new Date(sample.timestamp).getTime();
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;
  }
  
  const timeRange = {
    start: new Date(minTime),
    end: new Date(maxTime),
  };

  return {
    groups,
    timeRange,
    totalSamples: samples.length,
  };
}

/**
 * Generate a unique key for a metric series
 */
function getSeriesKey(name: string, labels: Record<string, string>): string {
  const labelStr = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  return labelStr ? `${name}{${labelStr}}` : name;
}

/**
 * Categorize metrics into logical groups
 */
function categorizeMetrics(series: MetricSeries[]): Record<string, MetricGroup> {
  const groups: Record<string, MetricGroup> = {
    tunnel: { name: 'Tunnel Health', metrics: [] },
    network: { name: 'Network & QUIC', metrics: [] },
    http: { name: 'HTTP Responses', metrics: [] },
    memory: { name: 'Memory & Resources', metrics: [] },
    process: { name: 'Process Metrics', metrics: [] },
    rpc: { name: 'RPC & Registration', metrics: [] },
    other: { name: 'Other Metrics', metrics: [] },
  };

  for (const metric of series) {
    const name = metric.name;
    
    if (name.startsWith('cloudflared_tunnel_')) {
      groups.tunnel.metrics.push(metric);
    } else if (name.startsWith('quic_client_') || name.includes('_latency')) {
      groups.network.metrics.push(metric);
    } else if (name.includes('response') || name.includes('request')) {
      groups.http.metrics.push(metric);
    } else if (name.startsWith('go_memstats_') || name.startsWith('go_gc_')) {
      groups.memory.metrics.push(metric);
    } else if (name.startsWith('process_') || name === 'go_goroutines' || name === 'go_threads') {
      groups.process.metrics.push(metric);
    } else if (name.startsWith('cloudflared_rpc_')) {
      groups.rpc.metrics.push(metric);
    } else {
      groups.other.metrics.push(metric);
    }
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, group]) => group.metrics.length > 0)
  );
}

/**
 * Format metric name for display
 */
export function formatMetricName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format labels for display
 */
export function formatLabels(labels: Record<string, string>): string {
  if (Object.keys(labels).length === 0) return '';
  return Object.entries(labels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ');
}

/**
 * Calculate rate of change for counter metrics
 */
export function calculateRate(series: MetricSeries): MetricSeries | null {
  if (series.type !== 'COUNTER' || series.data.length < 2) {
    return null;
  }

  const rateData = [];
  for (let i = 1; i < series.data.length; i++) {
    const prev = series.data[i - 1];
    const curr = series.data[i];
    const timeDiff = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000; // seconds
    const valueDiff = curr.value - prev.value;
    
    if (timeDiff > 0 && valueDiff >= 0) {
      rateData.push({
        timestamp: curr.timestamp,
        value: valueDiff / timeDiff,
      });
    }
  }

  return {
    name: `${series.name}_rate`,
    type: 'GAUGE',
    labels: series.labels,
    data: rateData,
  };
}

/**
 * Format byte values for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format duration in seconds for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} min`;
  return `${(seconds / 3600).toFixed(2)} h`;
}
