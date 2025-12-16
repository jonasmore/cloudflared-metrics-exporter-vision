import { Card, CardContent, CardHeader } from './ui/card';

export function ChartLoader() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Title with star skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-5 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
            </div>
            {/* Description skeleton */}
            <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
          
          {/* Chart Controls Skeleton - All 5 buttons in one row */}
          <div className="flex gap-1 bg-muted rounded-md p-1 animate-pulse">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Chart area skeleton with line chart */}
          <div className="h-[300px] bg-muted rounded animate-pulse relative overflow-hidden">
            {/* Simulated line chart */}
            <svg className="absolute inset-0 w-full h-full p-4 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Line 1 */}
              <polyline
                points="0,60 15,45 30,55 45,40 60,50 75,35 90,45 100,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
              {/* Line 2 */}
              <polyline
                points="0,70 15,65 30,75 45,60 60,70 75,55 90,65 100,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
              {/* Line 3 */}
              <polyline
                points="0,50 15,55 30,45 45,50 60,40 75,45 90,35 100,30"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
            </svg>
          </div>
          
          {/* Legend skeleton below chart */}
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-muted-foreground/30 rounded"></div>
              <div className="h-2 w-16 bg-muted-foreground/30 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-muted-foreground/30 rounded"></div>
              <div className="h-2 w-20 bg-muted-foreground/30 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-muted-foreground/30 rounded"></div>
              <div className="h-2 w-12 bg-muted-foreground/30 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
