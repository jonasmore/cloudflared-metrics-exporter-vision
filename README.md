<div align="center">
  <img src="public/logo.png" alt="Cloudflared Metrics Exporter Vision" width="200"/>
  
  # Cloudflared Metrics Exporter Vision
  
  A beautiful, Grafana-inspired web UI for visualizing cloudflared metrics exported to JSONL format.
  
  **[🚀 Live Demo](https://cloudflared-metrics-exporter-vision.jonasmore.dev)**
  
  🔒 **Privacy First**: All data is processed locally in your browser. No data is uploaded or leaves your device.

  [![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-5.1-646cff?logo=vite&logoColor=white)](https://vitejs.dev/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## Features

- 🎨 **Cloudflare brand colors** - Official Tangerine, Ruby, and Mango color palette
- 🌓 **Dark and light themes** with Grafana-inspired design
- 📊 **Interactive charts** powered by Recharts
- 📁 **Drag-and-drop** file upload
- 🏷️ **Automatic categorization** of metrics into logical groups
- 📈 **Multiple chart types** for different metric types (Line, Bar, Scatter)
- 🎯 **Label support** for multi-series metrics
- ⭐ **Favorites** - Star your most important metrics for quick access
- 📤 **CSV Export** - Export chart data and tables to CSV format
- 📱 **Mobile responsive** - Collapsible sidebar for mobile devices
- 🔍 **Search & filter** - Find metrics quickly with search
- 📊 **Data table view** - View raw data in a virtualized table
- 🎚️ **View modes** - Toggle between cumulative and delta views for counters
- ⚡ **Fast and responsive** built with React + Vite
- 🔒 **Privacy first** - All data processed locally in your browser

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A cloudflared metrics JSONL file (see below for how to generate)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Generating Metrics Files

### Using cloudflared-metrics-exporter

Export metrics using [cloudflared-metrics-exporter](https://github.com/jonasmore/cloudflared-metrics-exporter):

This tool:
- ✅ Automatically polls cloudflared's metrics endpoint (default: localhost:2000)
- ✅ Converts Prometheus format to JSONL
- ✅ Handles all metric types (COUNTER, GAUGE, HISTOGRAM, SUMMARY)
- ✅ Supports compression to save disk space
- ✅ Supports metric filtering and custom intervals

## Usage

1. **Export metrics** from cloudflared using cloudflared-metrics-exporter
2. **Open the web UI** in your browser
3. **Drag and drop** your `.jsonl` file or click to browse
4. **View your metrics** organized into categories with interactive charts

## Metric Categories

The visualizer automatically organizes metrics into these categories:

- **Tunnel Health** - HA connections, requests, errors
- **Network & QUIC** - QUIC client metrics, latency, connection stats
- **HTTP Responses** - Response codes and request metrics
- **Memory & Resources** - Go runtime memory statistics
- **Process Metrics** - CPU, memory, goroutines, threads
- **RPC & Registration** - RPC client/server operations

## Supported Metric Types

- **COUNTER** - Monotonically increasing values
- **GAUGE** - Values that can go up or down
- **HISTOGRAM** - Distribution of values with buckets
- **SUMMARY** - Quantile calculations
- **UNTYPED** - Generic metrics

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charting library
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── FileUpload.tsx   # Drag-and-drop file upload
│   ├── MetricChart.tsx  # Chart component
│   └── ThemeToggle.tsx  # Dark/light mode toggle
├── hooks/
│   └── useTheme.ts      # Theme management hook
├── types/
│   └── metrics.ts       # TypeScript type definitions
├── utils/
│   └── metricsParser.ts # JSONL parsing and data processing
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Type check
npm run build

# Lint code
npm run lint
```

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory.


## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Related

- [Cloudflared](https://github.com/cloudflare/cloudflared) - Cloudflare Tunnel client
- [Prometheus](https://prometheus.io/) - Metrics format
