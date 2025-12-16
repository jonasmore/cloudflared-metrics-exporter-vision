import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricSeries } from '@/types/metrics';
import { formatLabels, formatBytes, formatDuration } from '@/utils/metricsParser';
import { getMetricDescription, getMetricUnit } from '@/utils/metricDescriptions';
import { 
  ChartType, 
  ChartViewMode, 
  getChartSettings, 
  saveChartSettings,
  calculateDelta 
} from '@/utils/chartSettings';
import { MetricTableModal } from './MetricTableModal';
import { LineChart as LineChartIcon, BarChart3, ScatterChart as ScatterChartIcon, Table2, TrendingUp, Activity, List, Star, Download } from 'lucide-react';

interface MetricChartProps {
  series: MetricSeries[];
  title: string;
  onTimeRangeSelect?: (startTime: Date, endTime: Date) => void;
}

const CHART_COLORS = [
  '#F6821F', // Tangerine (Cloudflare primary)
  '#3E74FF', // Blueberry
  '#FF6633', // Ruby
  '#FBAD41', // Mango
  '#CE2F55', // Raspberry
  '#FFD43C', // Lemon
  '#0F006B', // Blackberry
  '#960C3E', // Cherry
];

export function MetricChart({ series, title, onTimeRangeSelect }: MetricChartProps) {
  if (series.length === 0) return null;

  const metricName = series[0].name;
  const metricType = series[0].type;
  const isCounter = metricType === 'COUNTER';
  
  // Load settings from local storage
  const initialSettings = getChartSettings(metricName);
  const [chartType, setChartType] = useState<ChartType>(initialSettings.chartType);
  const [viewMode, setViewMode] = useState<ChartViewMode>(initialSettings.viewMode);
  const [showTable, setShowTable] = useState(false);
  // Hide legend by default for charts with many series (>15)
  const [showLegend, setShowLegend] = useState(series.length <= 15);
  
  // Track which series are hidden
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  
  // Favorites state
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = localStorage.getItem('metricFavorites');
    if (favorites) {
      const favArray = JSON.parse(favorites);
      return favArray.includes(title);
    }
    return false;
  });
  
  // Drag-to-select state
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);

  // Process series data based on view mode
  const processedSeries = useMemo(() => {
    if (!isCounter || viewMode === 'cumulative') {
      return series;
    }
    
    // Calculate delta for counter metrics
    return series.map(s => ({
      ...s,
      data: calculateDelta(s.data),
    }));
  }, [series, viewMode, isCounter]);

  // Combine all data points from all series
  const allTimestamps = new Set<number>();
  processedSeries.forEach((s) => {
    s.data.forEach((d) => allTimestamps.add(d.timestamp.getTime()));
  });

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  // Create data points for the chart
  const chartData = sortedTimestamps.map((ts) => {
    const point: any = {
      timestamp: ts,
      time: new Date(ts).toLocaleTimeString(),
    };

    processedSeries.forEach((s) => {
      const dataPoint = s.data.find((d) => d.timestamp.getTime() === ts);
      const seriesKey = getSeriesLabel(s);
      point[seriesKey] = dataPoint?.value ?? null;
    });

    return point;
  });

  // Calculate latest value for each series (for legend display)
  const seriesLatestValues = useMemo(() => {
    const values = new Map<string, number>();
    processedSeries.forEach((s) => {
      const seriesKey = getSeriesLabel(s);
      // Get the latest non-null value
      const latestValue = s.data
        .slice()
        .reverse()
        .find(d => d.value !== null && d.value !== undefined)?.value;
      if (latestValue !== undefined) {
        values.set(seriesKey, latestValue);
      }
    });
    return values;
  }, [processedSeries]);

  const formatValue = (value: number): string => {
    const metricNameLower = metricName.toLowerCase();
    
    if (metricNameLower.includes('bytes') || metricNameLower.includes('memory')) {
      return formatBytes(value);
    }
    if (metricNameLower.includes('seconds') || metricNameLower.includes('duration')) {
      return formatDuration(value);
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  const metricDescription = getMetricDescription(metricName);
  const metricUnit = getMetricUnit(metricName);

  const handleChartTypeChange = (newType: ChartType) => {
    if (newType === 'table') {
      setShowTable(true);
      return;
    }
    setChartType(newType);
    saveChartSettings(metricName, { chartType: newType, viewMode });
  };

  const handleViewModeChange = (newMode: ChartViewMode) => {
    setViewMode(newMode);
    saveChartSettings(metricName, { chartType, viewMode: newMode });
  };

  // Handle drag-to-zoom
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  };

  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight && onTimeRangeSelect) {
      // Find the corresponding timestamps
      const leftIndex = chartData.findIndex((d) => d.time === refAreaLeft);
      const rightIndex = chartData.findIndex((d) => d.time === refAreaRight);
      
      if (leftIndex !== -1 && rightIndex !== -1) {
        const startIndex = Math.min(leftIndex, rightIndex);
        const endIndex = Math.max(leftIndex, rightIndex);
        
        const startTime = new Date(chartData[startIndex].timestamp);
        const endTime = new Date(chartData[endIndex].timestamp);
        
        onTimeRangeSelect(startTime, endTime);
      }
    }
    
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  // Handle legend click to toggle series visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    const favorites = localStorage.getItem('metricFavorites');
    let favArray: string[] = favorites ? JSON.parse(favorites) : [];
    
    if (isFavorite) {
      favArray = favArray.filter(f => f !== title);
    } else {
      favArray.push(title);
    }
    
    localStorage.setItem('metricFavorites', JSON.stringify(favArray));
    setIsFavorite(!isFavorite);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  // Export chart data to CSV
  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['Timestamp', 'Series', 'Labels', 'Value'];
    const csvRows = [headers.join(',')];

    // Add data rows from all series
    processedSeries.forEach((s) => {
      s.data.forEach((point) => {
        const csvRow = [
          point.timestamp.toISOString(),
          `"${s.name}"`,
          `"${formatLabels(s.labels) || '-'}"`,
          point.value,
        ];
        csvRows.push(csvRow.join(','));
      });
    });

    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
    };

    const commonAxisProps = {
      xAxis: {
        dataKey: "time",
        className: "text-xs",
        tick: { fill: 'currentColor' },
      },
      yAxis: {
        className: "text-xs",
        tick: { fill: 'currentColor' },
        tickFormatter: formatValue,
      },
    };

    const tooltipProps = {
      contentStyle: {
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        maxHeight: '400px',
        overflowY: 'auto' as const,
        maxWidth: '500px',
      },
      labelStyle: { color: 'hsl(var(--foreground))' },
      formatter: (value: any, name: string) => {
        if (value === null || value === undefined || typeof value !== 'number') return ['N/A', name];
        // Find the series to get short label
        const series = processedSeries.find(s => getSeriesLabel(s) === name);
        const shortName = series ? getShortSeriesLabel(series) : name;
        return [formatValue(value), shortName];
      },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart 
            {...commonProps}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            {showLegend && (
              <Legend 
                onClick={(e: any) => handleLegendClick(e.dataKey)}
                formatter={(_value: any, entry: any) => {
                  const dataKey = entry.dataKey;
                  const latestValue = seriesLatestValues.get(dataKey);
                  const series = processedSeries.find(s => getSeriesLabel(s) === dataKey);
                  const shortLabel = series ? getShortSeriesLabel(series) : dataKey;
                  
                  // Hide value if it's 0 (especially useful in delta view)
                  if (latestValue !== undefined && latestValue !== 0) {
                    return `${shortLabel}: ${formatValue(latestValue)}`;
                  }
                  return shortLabel;
                }}
                wrapperStyle={{ 
                  fontSize: '11px',
                  maxHeight: processedSeries.length > 5 ? '100px' : 'auto',
                  overflowY: processedSeries.length > 5 ? 'auto' : 'visible',
                  paddingTop: '8px',
                  lineHeight: '1.2',
                  cursor: 'pointer'
                }} 
              />
            )}
            {processedSeries.map((s, idx) => (
              <Bar
                key={getSeriesLabel(s)}
                dataKey={getSeriesLabel(s)}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                hide={hiddenSeries.has(getSeriesLabel(s))}
                opacity={hiddenSeries.has(getSeriesLabel(s)) ? 0 : 1}
              />
            ))}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#F6821F"
                fillOpacity={0.3}
              />
            )}
          </BarChart>
        );

      case 'scatter':
        return (
          <ScatterChart 
            {...commonProps}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            {showLegend && (
              <Legend 
                onClick={(e: any) => handleLegendClick(e.dataKey)}
                formatter={(_value: any, entry: any) => {
                  const dataKey = entry.dataKey;
                  const latestValue = seriesLatestValues.get(dataKey);
                  const series = processedSeries.find(s => getSeriesLabel(s) === dataKey);
                  const shortLabel = series ? getShortSeriesLabel(series) : dataKey;
                  
                  // Hide value if it's 0 (especially useful in delta view)
                  if (latestValue !== undefined && latestValue !== 0) {
                    return `${shortLabel}: ${formatValue(latestValue)}`;
                  }
                  return shortLabel;
                }}
                wrapperStyle={{ 
                  fontSize: '11px',
                  maxHeight: processedSeries.length > 5 ? '100px' : 'auto',
                  overflowY: processedSeries.length > 5 ? 'auto' : 'visible',
                  paddingTop: '8px',
                  lineHeight: '1.2',
                  cursor: 'pointer'
                }} 
              />
            )}
            {processedSeries.map((s, idx) => (
              <Scatter
                key={getSeriesLabel(s)}
                dataKey={getSeriesLabel(s)}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                hide={hiddenSeries.has(getSeriesLabel(s))}
              />
            ))}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#F6821F"
                fillOpacity={0.3}
              />
            )}
          </ScatterChart>
        );

      case 'line':
      default:
        return (
          <LineChart 
            {...commonProps}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis {...commonAxisProps.xAxis} />
            <YAxis {...commonAxisProps.yAxis} />
            <Tooltip {...tooltipProps} />
            {showLegend && (
              <Legend 
                onClick={(e: any) => handleLegendClick(e.dataKey)}
                formatter={(_value: any, entry: any) => {
                  const dataKey = entry.dataKey;
                  const latestValue = seriesLatestValues.get(dataKey);
                  const series = processedSeries.find(s => getSeriesLabel(s) === dataKey);
                  const shortLabel = series ? getShortSeriesLabel(series) : dataKey;
                  
                  // Hide value if it's 0 (especially useful in delta view)
                  if (latestValue !== undefined && latestValue !== 0) {
                    return `${shortLabel}: ${formatValue(latestValue)}`;
                  }
                  return shortLabel;
                }}
                wrapperStyle={{ 
                  fontSize: '11px',
                  maxHeight: processedSeries.length > 5 ? '100px' : 'auto',
                  overflowY: processedSeries.length > 5 ? 'auto' : 'visible',
                  paddingTop: '8px',
                  lineHeight: '1.2',
                  cursor: 'pointer'
                }} 
              />
            )}
            {processedSeries.map((s, idx) => (
              <Line
                key={getSeriesLabel(s)}
                type="monotone"
                dataKey={getSeriesLabel(s)}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                hide={hiddenSeries.has(getSeriesLabel(s))}
                connectNulls
              />
            ))}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#F6821F"
                fillOpacity={0.3}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline">
                <CardTitle className="text-lg inline">{title}</CardTitle>
                <span className="inline-flex items-center gap-1 ml-2 align-text-bottom">
                  <button
                    onClick={toggleFavorite}
                    className={`p-1 rounded transition-colors ${
                      isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
                    title="Export to CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <CardDescription className="text-xs space-y-1">
                <div>{metricType} • {series.length} series{metricUnit ? ` • Unit: ${metricUnit}` : ''}</div>
                {metricDescription && metricDescription !== 'No description available' && (
                  <div className="text-muted-foreground/80 italic">{metricDescription}</div>
                )}
              </CardDescription>
            </div>
            
            {/* Chart Controls */}
            <div className="flex flex-col gap-2">
              {/* Chart Type Buttons */}
              <div className="flex gap-1 bg-muted rounded-md p-1">
                <button
                  onClick={() => handleChartTypeChange('line')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'line' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('bar')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'bar' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('scatter')}
                  className={`p-1.5 rounded transition-colors ${
                    chartType === 'scatter' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
                  title="Scatter Chart"
                >
                  <ScatterChartIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleChartTypeChange('table')}
                  className="p-1.5 rounded hover:bg-card/50 transition-colors"
                  title="View as Table"
                >
                  <Table2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className={`p-1.5 rounded transition-colors ${
                    showLegend ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
                  title={showLegend ? 'Hide Legend' : 'Show Legend'}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* View Mode Toggle (only for counters) */}
              {isCounter && (
                <div className="flex gap-1 bg-muted rounded-md p-1">
                  <button
                    onClick={() => handleViewModeChange('cumulative')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'cumulative' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                    }`}
                    title="Cumulative View"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('delta')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'delta' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                    }`}
                    title="Delta View (Rate)"
                  >
                    <Activity className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table Modal */}
      {showTable && (
        <MetricTableModal
          series={processedSeries}
          title={title}
          onClose={() => setShowTable(false)}
        />
      )}
    </>
  );
}

function getSeriesLabel(series: MetricSeries): string {
  const labels = formatLabels(series.labels);
  if (labels) {
    return `${series.name}{${labels}}`;
  }
  return series.name;
}

function getShortSeriesLabel(series: MetricSeries): string {
  // For legend display - show only the most important labels
  const labels = series.labels;
  const importantKeys = ['frame_type', 'conn_index', 'le', 'quantile', 'code', 'method', 'handler'];
  
  const importantLabels = importantKeys
    .filter(key => labels[key] !== undefined)
    .map(key => `${key}="${labels[key]}"`)
    .join(', ');
  
  if (importantLabels) {
    return importantLabels;
  }
  
  // If no important labels, show first 2 labels
  const allLabels = Object.entries(labels).slice(0, 2)
    .map(([k, v]) => `${k}="${v}"`)
    .join(', ');
  
  return allLabels || series.name;
}
