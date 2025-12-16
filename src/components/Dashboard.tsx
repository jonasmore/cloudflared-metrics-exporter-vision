import { useState, useMemo, useRef } from 'react';
import { ParsedMetrics, MetricSeries } from '@/types/metrics';
import { MetricChart } from './MetricChart';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TimeRangeFilter } from './TimeRangeFilter';
import { Activity, Clock, Database, Search } from 'lucide-react';

interface DashboardProps {
  metrics: ParsedMetrics;
  filename: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function Dashboard({ metrics, selectedCategory, onCategoryChange: _onCategoryChange }: DashboardProps) {
  const [startTime, setStartTime] = useState<Date>(metrics.timeRange.start);
  const [endTime, setEndTime] = useState<Date>(metrics.timeRange.end);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('metricFavorites');
    return stored ? JSON.parse(stored) : [];
  });
  const chartsContainerRef = useRef<HTMLDivElement>(null);

  // Listen for favorites changes
  useMemo(() => {
    const handleFavoritesChange = () => {
      const stored = localStorage.getItem('metricFavorites');
      setFavorites(stored ? JSON.parse(stored) : []);
    };
    
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  // Filter metrics by time range
  const filteredMetrics = useMemo(() => {
    const filterSeriesData = (series: MetricSeries): MetricSeries => ({
      ...series,
      data: series.data.filter(
        (point) =>
          point.timestamp >= startTime && point.timestamp <= endTime
      ),
    });

    const filteredGroups = Object.entries(metrics.groups).reduce(
      (acc, [key, group]) => {
        const filteredMetricsList = group.metrics
          .map(filterSeriesData)
          .filter((series) => series.data.length > 0);

        if (filteredMetricsList.length > 0) {
          acc[key] = {
            ...group,
            metrics: filteredMetricsList,
          };
        }
        return acc;
      },
      {} as typeof metrics.groups
    );

    const totalSamples = Object.values(filteredGroups).reduce(
      (sum, group) =>
        sum + group.metrics.reduce((s, m) => s + m.data.length, 0),
      0
    );

    return {
      ...metrics,
      groups: filteredGroups,
      totalSamples,
      timeRange: { start: startTime, end: endTime },
    };
  }, [metrics, startTime, endTime]);

  const groupEntries = Object.entries(filteredMetrics.groups);
  
  // Create favorites group by matching chart titles
  const favoritesGroup = useMemo(() => {
    if (favorites.length === 0) return null;
    
    const favoriteMetrics: MetricSeries[] = [];
    const favoriteSet = new Set(favorites);
    
    // Go through all groups and their metrics
    groupEntries.forEach(([, group]) => {
      const chartItems = groupMetricsByBaseName(group.metrics);
      
      // Check each chart item
      chartItems.forEach(([baseName, seriesGroup]) => {
        const chartTitle = formatMetricTitle(baseName);
        
        // If this chart title is in favorites, add all its series
        if (favoriteSet.has(chartTitle)) {
          favoriteMetrics.push(...seriesGroup);
        }
      });
    });
    
    if (favoriteMetrics.length === 0) return null;
    
    return ['favorites', {
      name: 'Favorites',
      metrics: favoriteMetrics,
    }] as [string, typeof groupEntries[0][1]];
  }, [favorites, groupEntries]);
  
  // Apply category filter
  const categoryFilteredGroups =
    selectedCategory === 'all'
      ? groupEntries
      : selectedCategory === 'favorites' && favoritesGroup
      ? [favoritesGroup]
      : groupEntries.filter(([key]) => key === selectedCategory);
  
  // Apply search filter to metrics within groups
  const filteredGroups = useMemo(() => {
    // Add favorites group at the top if we're showing all categories
    const groupsToFilter = selectedCategory === 'all' && favoritesGroup
      ? [favoritesGroup, ...categoryFilteredGroups]
      : categoryFilteredGroups;
    
    if (!searchQuery.trim()) {
      return groupsToFilter;
    }
    
    const query = searchQuery.toLowerCase();
    return groupsToFilter
      .map(([key, group]) => {
        const filteredMetrics = group.metrics.filter((metric) =>
          metric.name.toLowerCase().includes(query)
        );
        return [key, { ...group, metrics: filteredMetrics }] as [string, typeof group];
      })
      .filter(([, group]) => group.metrics.length > 0);
  }, [categoryFilteredGroups, searchQuery, selectedCategory, favoritesGroup]);

  const handleResetTimeFilter = () => {
    setStartTime(metrics.timeRange.start);
    setEndTime(metrics.timeRange.end);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const formatDuration = (milliseconds: number) => {
    let remaining = Math.floor(milliseconds / 1000); // Total seconds
    
    const years = Math.floor(remaining / (365.25 * 24 * 60 * 60));
    remaining %= (365.25 * 24 * 60 * 60);
    
    const months = Math.floor(remaining / (30.44 * 24 * 60 * 60));
    remaining %= (30.44 * 24 * 60 * 60);
    
    const weeks = Math.floor(remaining / (7 * 24 * 60 * 60));
    remaining %= (7 * 24 * 60 * 60);
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    remaining %= (24 * 60 * 60);
    
    const hours = Math.floor(remaining / (60 * 60));
    remaining %= (60 * 60);
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    const parts = [];
    
    if (years > 0) {
      parts.push(`${years}y`);
      if (months > 0) parts.push(`${months}mo`);
    } else if (months > 0) {
      parts.push(`${months}mo`);
      if (weeks > 0) parts.push(`${weeks}w`);
    } else if (weeks > 0) {
      parts.push(`${weeks}w`);
      if (days > 0) parts.push(`${days}d`);
    } else if (days > 0) {
      parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
    } else if (hours > 0) {
      parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}min`);
    } else if (minutes > 0) {
      parts.push(`${minutes}min`);
      if (seconds > 0) parts.push(`${seconds}s`);
    } else {
      parts.push(`${seconds}s`);
    }

    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <TimeRangeFilter
        startTime={startTime}
        endTime={endTime}
        minTime={metrics.timeRange.start}
        maxTime={metrics.timeRange.end}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onReset={handleResetTimeFilter}
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search metrics by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredMetrics.totalSamples.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Range</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(endTime.getTime() - startTime.getTime())}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(startTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" title="Unique time series: each metric name + label combination">
              Metric Series
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(filteredMetrics.groups).reduce(
                (acc, group) => acc + group.metrics.length,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique metric + label combinations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredGroups.reduce((sum, [, group]) => sum + group.metrics.length, 0)} metric
          {filteredGroups.reduce((sum, [, group]) => sum + group.metrics.length, 0) !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* Charts */}
      <div ref={chartsContainerRef} className="space-y-8 overflow-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No metrics found matching your search.</p>
          </div>
        ) : (
          filteredGroups.map(([key, group]) => {
          const chartItems = groupMetricsByBaseName(group.metrics);
          
          return (
            <div key={key} className="space-y-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-semibold">{group.name}</h2>
                <span className="text-sm text-muted-foreground">
                  ({group.metrics.length} metrics)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {chartItems.map(
                  ([baseName, seriesGroup]) => (
                    <MetricChart
                      key={baseName}
                      series={seriesGroup}
                      title={formatMetricTitle(baseName)}
                      onTimeRangeSelect={(start, end) => {
                        setStartTime(start);
                        setEndTime(end);
                      }}
                    />
                  )
                )}
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}

/**
 * Group metrics by their base name (without label variations)
 * If a metric has too many series (>15), split it by a primary label
 */
function groupMetricsByBaseName(
  metrics: ParsedMetrics['groups'][string]['metrics']
): [string, typeof metrics][] {
  const grouped = new Map<string, typeof metrics>();

  for (const metric of metrics) {
    const baseName = metric.name;
    if (!grouped.has(baseName)) {
      grouped.set(baseName, []);
    }
    grouped.get(baseName)!.push(metric);
  }

  const result: [string, typeof metrics][] = [];
  
  // Split metrics with too many series
  for (const [baseName, seriesGroup] of grouped.entries()) {
    if (seriesGroup.length > 15) {
      // Find the most common label key to split by
      const labelKeys = new Set<string>();
      seriesGroup.forEach(s => Object.keys(s.labels).forEach(k => labelKeys.add(k)));
      
      // Prefer splitting by these keys in order
      const preferredKeys = ['frame_type', 'conn_index', 'code', 'method', 'handler', 'quantile', 'le'];
      const splitKey = preferredKeys.find(k => labelKeys.has(k)) || Array.from(labelKeys)[0];
      
      if (splitKey) {
        // Group by the split key value
        const subGroups = new Map<string, typeof metrics>();
        seriesGroup.forEach(s => {
          const labelValue = s.labels[splitKey] || 'other';
          const subKey = `${baseName} (${splitKey}="${labelValue}")`;
          if (!subGroups.has(subKey)) {
            subGroups.set(subKey, []);
          }
          subGroups.get(subKey)!.push(s);
        });
        
        // Add each subgroup as a separate chart
        subGroups.forEach((series, subKey) => {
          result.push([subKey, series]);
        });
      } else {
        result.push([baseName, seriesGroup]);
      }
    } else {
      result.push([baseName, seriesGroup]);
    }
  }

  return result;
}

/**
 * Format metric name for display as title
 */
function formatMetricTitle(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
