import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MetricSeries } from '@/types/metrics';
import { formatLabels } from '@/utils/metricsParser';
import { X, Download } from 'lucide-react';

interface MetricTableModalProps {
  series: MetricSeries[];
  title: string;
  onClose: () => void;
}

interface TableRow {
  timestamp: Date;
  seriesName: string;
  labels: string;
  value: number;
}

export function MetricTableModal({ series, title, onClose }: MetricTableModalProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Flatten all data points into a single array for virtualization
  const allRows = useMemo<TableRow[]>(() => {
    return series.flatMap((s) =>
      s.data.map((point) => ({
        timestamp: point.timestamp,
        seriesName: s.name,
        labels: formatLabels(s.labels) || '-',
        value: point.value,
      }))
    );
  }, [series]);

  // Export to CSV function
  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['Timestamp', 'Series', 'Labels', 'Value'];
    const csvRows = [headers.join(',')];

    // Add data rows
    allRows.forEach((row) => {
      const csvRow = [
        row.timestamp.toISOString(),
        `"${row.seriesName}"`,
        `"${row.labels}"`,
        row.value,
      ];
      csvRows.push(csvRow.join(','));
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

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Estimated row height
    overscan: 10, // Render 10 extra items above and below viewport
  });

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg z-10">
          <h2 className="text-xl font-semibold">{title} - Data Table</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors text-sm font-medium"
              aria-label="Export to CSV"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-4 pt-4 pb-2 border-b bg-card z-10">
          <div className="grid grid-cols-12 gap-2 text-sm font-semibold">
            <div className="col-span-4 text-left">Timestamp</div>
            <div className="col-span-3 text-left">Series</div>
            <div className="col-span-3 text-left">Labels</div>
            <div className="col-span-2 text-right">Value</div>
          </div>
        </div>

        {/* Virtualized Table Body */}
        <div ref={parentRef} className="flex-1 overflow-auto px-4">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = allRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-12 gap-2 text-sm border-b hover:bg-muted/50 py-2"
                >
                  <div className="col-span-4 font-mono text-xs truncate">
                    {row.timestamp.toLocaleString()}
                  </div>
                  <div className="col-span-3 font-mono text-xs truncate">
                    {row.seriesName}
                  </div>
                  <div className="col-span-3 font-mono text-xs truncate">
                    {row.labels}
                  </div>
                  <div className="col-span-2 text-right font-mono truncate">
                    {row.value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Total data points: {allRows.length.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
