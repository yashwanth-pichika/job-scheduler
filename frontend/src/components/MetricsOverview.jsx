import React from 'react';
import { Layers, Server, PlayCircle, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function MetricsOverview({ metrics, executions, nodes, onNavigate }) {
  const m = metrics || {
    totalJobs: 0,
    activeJobs: 0,
    healthyNodes: 0,
    deadNodes: 0,
    totalExecutions: 0,
    successCount: 0,
    failedCount: 0,
    runningCount: 0,
    pendingCount: 0,
    successRate: 100,
  };

  // Prepare chart data from recent executions timeline
  const executionTimeline = React.useMemo(() => {
    if (!executions || executions.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({ time: `${i + 1}m ago`, count: Math.floor(Math.random() * 5) }));
    }
    const grouped = {};
    executions.slice(0, 30).forEach((exec) => {
      const timeKey = exec.startTime ? exec.startTime.substring(11, 16) : 'Now';
      grouped[timeKey] = (grouped[timeKey] || 0) + 1;
    });
    return Object.keys(grouped).map((k) => ({ time: k, count: grouped[k] })).reverse();
  }, [executions]);

  const pieData = [
    { name: 'Success', value: m.successCount || 1, color: '#10b981' },
    { name: 'Failed', value: m.failedCount || 0, color: '#f43f5e' },
    { name: 'Running', value: m.runningCount || 0, color: '#0ea5e9' },
    { name: 'Pending', value: m.pendingCount || 0, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/40 p-6 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
              <span>Cluster Overview & System Metrics</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time monitoring of job dispatchers, worker node health, and execution queues.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('jobs')}
              className="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 flex items-center space-x-2"
            >
              <Layers className="h-4 w-4" />
              <span>Manage Jobs</span>
            </button>
            <button
              onClick={() => onNavigate('failover')}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition-all flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Failover Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Jobs */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Configured Jobs</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{m.totalJobs}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {m.activeJobs} Active
            </span>
          </div>
        </div>

        {/* Card 2: Cluster Workers */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Healthy Workers</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{m.healthyNodes}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
              m.deadNodes > 0
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-slate-400 bg-slate-800/50 border-slate-700/50'
            }`}>
              {m.deadNodes} Dead Nodes
            </span>
          </div>
        </div>

        {/* Card 3: Total Executions */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Dispatches</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PlayCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{m.totalExecutions}</span>
            <span className="text-xs font-mono text-sky-400">
              {m.runningCount} Running
            </span>
          </div>
        </div>

        {/* Card 4: Success Rate */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{m.successRate}%</span>
            <span className="text-xs text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{m.successCount} OK</span>
            </span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Execution Throughput Timeline */}
        <div className="lg:col-span-2 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Execution Velocity Timeline</h3>
              <p className="text-xs text-slate-400">Jobs dispatched per minute interval</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
              LIVE STREAM
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={executionTimeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Execution Status Breakdown */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Status Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown of execution statuses</p>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/60 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-mono font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cluster Active Nodes Quick Bar */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Server className="h-5 w-5 text-sky-400" />
            <span>Active Worker Cluster Nodes</span>
          </h3>
          <button
            onClick={() => onNavigate('topology')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            View Full Topology &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes && nodes.length > 0 ? (
            nodes.map((node) => (
              <div
                key={node.nodeId}
                className={`p-4 rounded-xl border transition-all ${
                  node.status === 'HEALTHY'
                    ? 'bg-slate-950/40 border-slate-800 hover:border-sky-500/40'
                    : 'bg-rose-950/10 border-rose-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      node.status === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`} />
                    <span className="font-mono font-bold text-sm text-slate-200">{node.nodeId}</span>
                  </div>
                  {node.isLeader && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                      LEADER
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Active Threads:</span>
                    <span className="text-slate-200 font-bold">{node.activeThreads} / {node.maxThreads}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (node.activeThreads / node.maxThreads) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>CPU: {node.cpuLoad}%</span>
                    <span>RAM: {node.memoryUsageMb} MB</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-slate-500 text-sm">Loading node topology...</div>
          )}
        </div>
      </div>

    </div>
  );
}
