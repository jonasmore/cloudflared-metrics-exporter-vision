/**
 * Metric descriptions based on Cloudflare Tunnel documentation
 * Source: https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/monitor-tunnels/metrics/
 */

export interface MetricInfo {
  name: string;
  description: string;
  type: 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'SUMMARY';
  unit?: string;
  category: string;
}

export const METRIC_DESCRIPTIONS: Record<string, MetricInfo> = {
  // Build Info
  'build_info': {
    name: 'Build Information',
    description: 'Information about the cloudflared build including Go version, revision, type, and version',
    type: 'GAUGE',
    category: 'System Info',
  },

  // Configuration Metrics
  'cloudflared_config_local_config_pushes': {
    name: 'Local Config Pushes',
    description: 'Total number of local configuration pushes to cloudflared',
    type: 'COUNTER',
    category: 'Configuration',
  },
  'cloudflared_config_local_config_pushes_errors': {
    name: 'Local Config Push Errors',
    description: 'Total number of errors when pushing local configuration',
    type: 'COUNTER',
    category: 'Configuration',
  },
  'cloudflared_orchestration_config_version': {
    name: 'Orchestration Config Version',
    description: 'Current version of the orchestration configuration',
    type: 'GAUGE',
    category: 'Configuration',
  },

  // TCP Session Metrics
  'cloudflared_tcp_active_sessions': {
    name: 'Active TCP Sessions',
    description: 'Number of currently active TCP sessions through the tunnel',
    type: 'GAUGE',
    category: 'TCP',
  },
  'cloudflared_tcp_total_sessions': {
    name: 'Total TCP Sessions',
    description: 'Cumulative count of all TCP sessions established',
    type: 'COUNTER',
    category: 'TCP',
  },

  // UDP Session Metrics
  'cloudflared_udp_active_sessions': {
    name: 'Active UDP Sessions',
    description: 'Number of currently active UDP sessions through the tunnel',
    type: 'GAUGE',
    category: 'UDP',
  },
  'cloudflared_udp_total_sessions': {
    name: 'Total UDP Sessions',
    description: 'Cumulative count of all UDP sessions established',
    type: 'COUNTER',
    category: 'UDP',
  },

  // Tunnel Core Metrics
  'cloudflared_tunnel_active_streams': {
    name: 'Active Streams',
    description: 'Number of currently active streams in the tunnel',
    type: 'GAUGE',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_concurrent_requests_per_tunnel': {
    name: 'Concurrent Requests',
    description: 'Number of concurrent HTTP requests being processed per tunnel',
    type: 'GAUGE',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_ha_connections': {
    name: 'HA Connections',
    description: 'Number of active high-availability connections to Cloudflare edge. Typically 4 connections for redundancy',
    type: 'GAUGE',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_request_errors': {
    name: 'Request Errors',
    description: 'Total number of request errors encountered by the tunnel',
    type: 'COUNTER',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_total_requests': {
    name: 'Total Requests',
    description: 'Cumulative count of all requests processed through the tunnel',
    type: 'COUNTER',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_server_locations': {
    name: 'Server Locations',
    description: 'Cloudflare edge server locations the tunnel is connected to. Labels: connection_id, edge_location',
    type: 'GAUGE',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_timer_retries': {
    name: 'Timer Retries',
    description: 'Number of timer-based retry attempts for tunnel operations',
    type: 'COUNTER',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_tunnel_authenticate_success': {
    name: 'Authentication Successes',
    description: 'Number of successful tunnel authentication attempts',
    type: 'COUNTER',
    category: 'Tunnel Health',
  },
  'cloudflared_tunnel_tunnel_register_success': {
    name: 'Registration Successes',
    description: 'Number of successful tunnel registration attempts. Label: rpcName',
    type: 'COUNTER',
    category: 'Tunnel Health',
  },

  // QUIC Client Metrics
  'quic_client_closed_connections': {
    name: 'QUIC Closed Connections',
    description: 'Total number of QUIC connections that have been closed',
    type: 'COUNTER',
    category: 'Network & QUIC',
  },
  'quic_client_total_connections': {
    name: 'QUIC Total Connections',
    description: 'Cumulative count of all QUIC connections established',
    type: 'COUNTER',
    category: 'Network & QUIC',
  },
  'quic_client_latest_rtt': {
    name: 'QUIC Latest RTT',
    description: 'Most recent round-trip time measurement for QUIC connection. Label: conn_index',
    type: 'GAUGE',
    unit: 'ms',
    category: 'Network & QUIC',
  },
  'quic_client_min_rtt': {
    name: 'QUIC Minimum RTT',
    description: 'Minimum round-trip time observed for QUIC connection. Label: conn_index',
    type: 'GAUGE',
    unit: 'ms',
    category: 'Network & QUIC',
  },
  'quic_client_smoothed_rtt': {
    name: 'QUIC Smoothed RTT',
    description: 'Smoothed (averaged) round-trip time for QUIC connection. Label: conn_index',
    type: 'GAUGE',
    unit: 'ms',
    category: 'Network & QUIC',
  },
  'quic_client_lost_packets': {
    name: 'QUIC Lost Packets',
    description: 'Number of packets lost on QUIC connection. Labels: conn_index, reason',
    type: 'COUNTER',
    category: 'Network & QUIC',
  },
  'quic_client_packet_too_big_dropped': {
    name: 'QUIC Packets Dropped (Too Big)',
    description: 'Number of packets dropped because they exceeded maximum size',
    type: 'COUNTER',
    category: 'Network & QUIC',
  },

  // CoreDNS Metrics
  'coredns_panics_total': {
    name: 'CoreDNS Panics',
    description: 'Total number of panics in the CoreDNS resolver',
    type: 'COUNTER',
    category: 'DNS',
  },

  // Prometheus Handler Metrics
  'promhttp_metric_handler_requests_in_flight': {
    name: 'Metrics Requests In Flight',
    description: 'Current number of requests being handled by the metrics endpoint',
    type: 'GAUGE',
    category: 'Metrics Server',
  },
  'promhttp_metric_handler_requests_total': {
    name: 'Total Metrics Requests',
    description: 'Total number of requests to the metrics endpoint. Label: code (HTTP status)',
    type: 'COUNTER',
    category: 'Metrics Server',
  },

  // Go Runtime Metrics
  'go_gc_duration_seconds': {
    name: 'GC Duration',
    description: 'Duration of garbage collection cycles in seconds',
    type: 'SUMMARY',
    unit: 'seconds',
    category: 'Go Runtime',
  },
  'go_goroutines': {
    name: 'Goroutines',
    description: 'Number of goroutines currently running in the Go runtime',
    type: 'GAUGE',
    category: 'Go Runtime',
  },
  'go_info': {
    name: 'Go Version Info',
    description: 'Information about the Go runtime version',
    type: 'GAUGE',
    category: 'Go Runtime',
  },
  'go_memstats_alloc_bytes': {
    name: 'Allocated Memory',
    description: 'Bytes of allocated heap objects currently in use',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_alloc_bytes_total': {
    name: 'Total Allocated Memory',
    description: 'Cumulative bytes allocated for heap objects',
    type: 'COUNTER',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_buck_hash_sys_bytes': {
    name: 'Bucket Hash System Memory',
    description: 'Bytes of memory used by the profiling bucket hash table',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_frees_total': {
    name: 'Total Frees',
    description: 'Cumulative count of heap objects freed',
    type: 'COUNTER',
    category: 'Memory',
  },
  'go_memstats_gc_sys_bytes': {
    name: 'GC System Memory',
    description: 'Bytes of memory used for garbage collection metadata',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_heap_alloc_bytes': {
    name: 'Heap Allocated',
    description: 'Bytes of allocated heap objects',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_heap_idle_bytes': {
    name: 'Heap Idle',
    description: 'Bytes in idle (unused) heap spans',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_heap_inuse_bytes': {
    name: 'Heap In Use',
    description: 'Bytes in in-use heap spans',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_heap_objects': {
    name: 'Heap Objects',
    description: 'Number of allocated heap objects',
    type: 'GAUGE',
    category: 'Memory',
  },
  'go_memstats_heap_released_bytes': {
    name: 'Heap Released',
    description: 'Bytes of physical memory returned to the OS',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_heap_sys_bytes': {
    name: 'Heap System Memory',
    description: 'Bytes of heap memory obtained from the OS',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_last_gc_time_seconds': {
    name: 'Last GC Time',
    description: 'Unix timestamp of the last garbage collection',
    type: 'GAUGE',
    unit: 'seconds',
    category: 'Memory',
  },
  'go_memstats_lookups_total': {
    name: 'Total Pointer Lookups',
    description: 'Cumulative count of pointer lookups performed by the runtime',
    type: 'COUNTER',
    category: 'Memory',
  },
  'go_memstats_mallocs_total': {
    name: 'Total Mallocs',
    description: 'Cumulative count of heap objects allocated',
    type: 'COUNTER',
    category: 'Memory',
  },
  'go_memstats_mcache_inuse_bytes': {
    name: 'MCache In Use',
    description: 'Bytes of allocated mcache structures',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_mcache_sys_bytes': {
    name: 'MCache System Memory',
    description: 'Bytes of memory obtained from the OS for mcache structures',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_mspan_inuse_bytes': {
    name: 'MSpan In Use',
    description: 'Bytes of allocated mspan structures',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_mspan_sys_bytes': {
    name: 'MSpan System Memory',
    description: 'Bytes of memory obtained from the OS for mspan structures',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_next_gc_bytes': {
    name: 'Next GC Target',
    description: 'Target heap size for the next garbage collection',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_other_sys_bytes': {
    name: 'Other System Memory',
    description: 'Bytes of memory used for other runtime allocations',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_stack_inuse_bytes': {
    name: 'Stack In Use',
    description: 'Bytes in stack spans currently in use',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_stack_sys_bytes': {
    name: 'Stack System Memory',
    description: 'Bytes of stack memory obtained from the OS',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_memstats_sys_bytes': {
    name: 'Total System Memory',
    description: 'Total bytes of memory obtained from the OS',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Memory',
  },
  'go_threads': {
    name: 'OS Threads',
    description: 'Number of OS threads created',
    type: 'GAUGE',
    category: 'Process',
  },
  'go_gc_gogc_percent': {
    name: 'GOGC Percentage',
    description: 'The GOGC garbage collection target percentage',
    type: 'GAUGE',
    unit: '%',
    category: 'Go Runtime',
  },
  'go_gc_gomemlimit_bytes': {
    name: 'Go Memory Limit',
    description: 'Go runtime memory limit in bytes',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Go Runtime',
  },
  'go_sched_gomaxprocs_threads': {
    name: 'GOMAXPROCS',
    description: 'Maximum number of OS threads that can execute Go code simultaneously',
    type: 'GAUGE',
    category: 'Go Runtime',
  },

  // Process Metrics
  'process_cpu_seconds_total': {
    name: 'CPU Time',
    description: 'Total user and system CPU time spent in seconds',
    type: 'COUNTER',
    unit: 'seconds',
    category: 'Process',
  },
  'process_max_fds': {
    name: 'Maximum File Descriptors',
    description: 'Maximum number of open file descriptors',
    type: 'GAUGE',
    category: 'Process',
  },
  'process_open_fds': {
    name: 'Open File Descriptors',
    description: 'Number of currently open file descriptors',
    type: 'GAUGE',
    category: 'Process',
  },
  'process_resident_memory_bytes': {
    name: 'Resident Memory',
    description: 'Resident memory size in bytes (RSS)',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Process',
  },
  'process_start_time_seconds': {
    name: 'Process Start Time',
    description: 'Unix timestamp of when the process started',
    type: 'GAUGE',
    unit: 'seconds',
    category: 'Process',
  },
  'process_virtual_memory_bytes': {
    name: 'Virtual Memory',
    description: 'Virtual memory size in bytes',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Process',
  },
  'process_virtual_memory_max_bytes': {
    name: 'Maximum Virtual Memory',
    description: 'Maximum amount of virtual memory available',
    type: 'GAUGE',
    unit: 'bytes',
    category: 'Process',
  },
};

/**
 * Get description for a metric by name
 */
export function getMetricDescription(metricName: string): string {
  const info = METRIC_DESCRIPTIONS[metricName];
  return info?.description || 'No description available';
}

/**
 * Get full metric info
 */
export function getMetricInfo(metricName: string): MetricInfo | null {
  return METRIC_DESCRIPTIONS[metricName] || null;
}

/**
 * Get metric unit
 */
export function getMetricUnit(metricName: string): string | undefined {
  return METRIC_DESCRIPTIONS[metricName]?.unit;
}
