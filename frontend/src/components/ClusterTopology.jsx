import React from 'react';
import { Server, Cpu, HardDrive, ShieldCheck, Activity, Plus, Skull, RefreshCw, Radio } from 'lucide-react';

export default function ClusterTopology({ nodes, onSpawnWorker, onCrashWorker }) {
  const leaderNode = nodes.find((n) => n.isLeader);
  const workerNodes = nodes.filter((n) => !n.isLeader);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Radio className="h-5 w-5 text-sky-400 animate-pulse" />
            <span>Cluster Network Topology</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time consensus, heartbeat matrix, thread utilization, and node status.
          </p>
        </div>

        <button
          onClick={() => {
            const newId = `worker-${workerNodes.length + 1}`;
            onSpawnWorker(newId, 5);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Worker Node</span>
        </button>
      </div>

      {/* Topology Graphical Diagram */}
      <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        
        {/* Background Network Grid Effect */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col items-center space-y-12">
          
          {/* LEADER / COORDINATOR NODE */}
          {leaderNode ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-sky-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative bg-slate-900 p-6 rounded-2xl border border-amber-500/40 w-80 text-center shadow-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/30 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>MASTER COORDINATOR</span>
                </div>
                <h3 className="text-lg font-bold text-white font-mono">{leaderNode.nodeId}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{leaderNode.ipAddress} • {leaderNode.hostname}</p>
                
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">ROLE</div>
                    <div className="font-bold text-amber-400">Leader Lock</div>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">DISPATCHER</div>
                    <div className="font-bold text-emerald-400">Active</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-amber-400 text-sm">Leader Election in progress...</div>
          )}

          {/* Connection Cables Visual Lines */}
          <div className="w-full max-w-2xl flex justify-around relative">
            <div className="h-8 w-0.5 bg-gradient-to-b from-sky-500 to-slate-700 animate-pulse" />
          </div>

          {/* WORKER NODES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {workerNodes.map((worker) => {
              const isHealthy = worker.status === 'HEALTHY';
              const threadPercent = Math.min(100, Math.round((worker.activeThreads / worker.maxThreads) * 100));

              return (
                <div
                  key={worker.nodeId}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                    isHealthy
                      ? 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 shadow-xl'
                      : 'bg-rose-950/20 border-rose-900/60 shadow-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`h-3 w-3 rounded-full ${
                        isHealthy ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                      }`} />
                      <span className="font-mono font-bold text-base text-white">{worker.nodeId}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isHealthy
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {worker.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono mt-1">{worker.ipAddress}</p>

                  {/* Thread Pool Utilization Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Thread Pool:</span>
                      <span className="font-bold text-slate-200">{worker.activeThreads} / {worker.maxThreads} Active</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          threadPercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${threadPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Hardware Gauges */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Cpu className="h-3 w-3 text-sky-400" />
                        <span>CPU LOAD</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5">{worker.cpuLoad}%</div>
                    </div>

                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <HardDrive className="h-3 w-3 text-cyan-400" />
                        <span>MEMORY</span>
                      </div>
                      <div className="font-bold text-slate-200 mt-0.5">{worker.memoryUsageMb} MB</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-slate-500">
                      Pulse: {worker.lastHeartbeat ? worker.lastHeartbeat.substring(11, 19) : '—'}
                    </div>

                    {isHealthy ? (
                      <button
                        onClick={() => onCrashWorker(worker.nodeId)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[11px] font-medium flex items-center space-x-1 transition-all"
                      >
                        <Skull className="h-3 w-3" />
                        <span>Simulate Crash</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSpawnWorker(worker.nodeId, 5)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-medium flex items-center space-x-1 transition-all"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Restart Worker</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
