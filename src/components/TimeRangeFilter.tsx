import { Calendar, X } from 'lucide-react';

interface TimeRangeFilterProps {
  startTime: Date;
  endTime: Date;
  minTime: Date;
  maxTime: Date;
  onStartTimeChange: (date: Date) => void;
  onEndTimeChange: (date: Date) => void;
  onReset: () => void;
}

export function TimeRangeFilter({
  startTime,
  endTime,
  minTime,
  maxTime,
  onStartTimeChange,
  onEndTimeChange,
  onReset,
}: TimeRangeFilterProps) {
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onStartTimeChange(newDate);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onEndTimeChange(newDate);
    }
  };

  const isFiltered = startTime.getTime() !== minTime.getTime() || endTime.getTime() !== maxTime.getTime();

  return (
    <div className="flex items-center gap-3 bg-card border rounded-lg p-4">
      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <label htmlFor="start-time" className="text-sm text-muted-foreground whitespace-nowrap">
            From:
          </label>
          <input
            id="start-time"
            type="datetime-local"
            value={formatDateTimeLocal(startTime)}
            min={formatDateTimeLocal(minTime)}
            max={formatDateTimeLocal(endTime)}
            onChange={handleStartChange}
            className="px-2 py-1 text-sm border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="end-time" className="text-sm text-muted-foreground whitespace-nowrap">
            To:
          </label>
          <input
            id="end-time"
            type="datetime-local"
            value={formatDateTimeLocal(endTime)}
            min={formatDateTimeLocal(startTime)}
            max={formatDateTimeLocal(maxTime)}
            onChange={handleEndChange}
            className="px-2 py-1 text-sm border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {isFiltered && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded transition-colors"
          title="Reset time filter"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  );
}
