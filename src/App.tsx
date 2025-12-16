import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { parseJSONL } from './utils/metricsParser';
import { ParsedMetrics } from './types/metrics';
import { AlertCircle, Activity, Database, Clock, Github, Star, Menu, X } from 'lucide-react';

function App() {
  const [metrics, setMetrics] = useState<ParsedMetrics | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileLoad = (content: string, name: string) => {
    try {
      setError('');
      const parsed = parseJSONL(content);
      setMetrics(parsed);
      setFilename(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setMetrics(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed lg:sticky top-0 left-0 z-50 lg:z-0
        w-64 h-screen border-r bg-card flex-shrink-0
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
      `}>
        <div className="h-screen flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <img 
                  src="/logo.png" 
                  alt="Cloudflared Logo" 
                  className="h-8 w-8 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-semibold truncate">Metrics Visualizer</h1>
                  <p className="text-xs text-muted-foreground truncate">cloudflared</p>
                </div>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Analyze
            </div>
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>All Metrics</span>
            </button>
            {metrics && (
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                  Categories
                </div>
                <button 
                  onClick={() => setSelectedCategory('favorites')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === 'favorites' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  <span>Favorites</span>
                </button>
                {Object.entries(metrics.groups).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === key
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {group.metrics.length}
                    </span>
                  </button>
                ))}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Theme</span>
              <ThemeToggle />
            </div>
            <a
              href="https://github.com/jonasmore/cloudflared-metrics-exporter-vision"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h2 className="text-lg font-semibold">
              {metrics ? 'Metrics Dashboard' : 'Upload Metrics'}
            </h2>
            {filename && (
              <span className="text-sm text-muted-foreground">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {metrics && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {metrics.totalSamples.toLocaleString()} samples
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {((metrics.timeRange.end.getTime() - metrics.timeRange.start.getTime()) / 1000).toFixed(0)}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        )}

        {!metrics ? (
          <div className="max-w-2xl mx-auto mt-12">
            <FileUpload onFileLoad={handleFileLoad} />
            <div className="mt-8 space-y-4 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground">How to use:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Export metrics using{' '}
                  <a 
                    href="https://github.com/jonasmore/cloudflared-metrics-exporter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    cloudflared-metrics-exporter
                  </a>
                </li>
                <li>Drag and drop the .jsonl file here or click to browse</li>
                <li>View your metrics visualized in charts</li>
              </ol>
              <p className="mt-4">
                Example command:
                <code className="block mt-2 p-3 bg-muted rounded text-xs">
                  cloudflared-metrics-exporter --metrics localhost:2000 --metricsfile metrics.jsonl
                </code>
              </p>
            </div>
          </div>
        ) : (
          <Dashboard 
            metrics={metrics} 
            filename={filename} 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}
        </main>
      </div>
    </div>
  );
}

export default App;
