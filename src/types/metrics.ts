export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'SUMMARY' | 'UNTYPED';

export interface MetricSample {
  timestamp: string;
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface MetricSeries {
  name: string;
  type: MetricType;
  labels: Record<string, string>;
  data: TimeSeriesPoint[];
}

export interface MetricGroup {
  name: string;
  metrics: MetricSeries[];
}

export interface ParsedMetrics {
  groups: Record<string, MetricGroup>;
  timeRange: {
    start: Date;
    end: Date;
  };
  totalSamples: number;
}
