import React, { useState } from 'react';
import { Terminal, Filter, Search, Info, AlertTriangle, XCircle, CheckCircle, Clock, Eye } from 'lucide-react';

export default function ExecutionLogs({ logs, executions }) {
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecution, setSelectedExecution] = useState(null);

  const filteredLogs = (logs || []).filter((log) => {
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.nodeId && log.nodeId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-sky-400" />
            <span>Execution Audit & Stream Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stdout, stderr, exception tracebacks, and dispatcher logs across worker nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Streaming Live Logs</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                levelFilter === lvl
                  ? lvl === 'ERROR'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : lvl === 'WARN'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search logs by keyword or node ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          />
        </div>

      </div>

      {/* Terminal View Container */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl font-mono text-xs overflow-hidden">
        
        {/* Terminal Header Bar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-bold text-slate-300">scheduler.log</span>
          </div>
          <div>{filteredLogs.length} events logged</div>
        </div>

        {/* Console Body */}
        <div className="p-4 max-h-[500px] overflow-y-auto space-y-2 divide-y divide-slate-900/60">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No log entries matched your filter criteria.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-2 hover:bg-slate-900/40 p-1.5 rounded transition-colors flex items-start space-x-3">
                <span className="text-slate-600 shrink-0 select-none text-[11px]">
                  {log.timestamp ? log.timestamp.substring(11, 19) : '00:00:00'}
                </span>

                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'ERROR'
                    ? 'bg-rose-500/20 text-rose-400'
                    : log.level === 'WARN'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-sky-500/20 text-sky-400'
                }`}>
                  [{log.level}]
                </span>

                <span className="text-slate-400 shrink-0 font-bold">
                  [{log.nodeId || 'SYSTEM'}]:
                </span>

                <span className={`flex-1 break-all ${
                  log.level === 'ERROR' ? 'text-rose-300' : log.level === 'WARN' ? 'text-amber-300' : 'text-slate-200'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Execution History Table */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Recent Job Executions Audit</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Exec ID</th>
                <th className="px-4 py-3">Job Name</th>
                <th className="px-4 py-3">Node</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Retries</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Start Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {(executions || []).slice(0, 15).map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-bold text-sky-400">#{exec.id}</td>
                  <td className="px-4 py-3 text-slate-100">{exec.jobName}</td>
                  <td className="px-4 py-3">{exec.workerNodeId || 'QUEUED'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      exec.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : exec.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-sky-500/10 text-sky-400'
                    }`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{exec.retryCount}</td>
                  <td className="px-4 py-3">{exec.durationMs ? `${exec.durationMs}ms` : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{exec.startTime ? exec.startTime.substring(11, 19) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
