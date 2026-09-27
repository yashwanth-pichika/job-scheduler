import React, { useState } from 'react';
import { ShieldAlert, Zap, Skull, RefreshCw, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FailoverSimulator({ nodes, jobs, onTriggerJob, onCrashWorker, onSpawnWorker }) {
  const [logMessages, setLogMessages] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const addLog = (msg) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 20)]);
  };

  const handleSimulateBurst = async () => {
    setIsSimulating(true);
    addLog('🚀 SIMULATION: Triggering 5 parallel job executions across active cluster nodes...');
    try {
      if (jobs.length > 0) {
        for (let i = 0; i < 5; i++) {
          const targetJob = jobs[i % jobs.length];
          await onTriggerJob(targetJob.id);
          addLog(`Queued manual execution #${i + 1} for job [${targetJob.name}]`);
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleKillRandomWorker = async () => {
    const activeWorkers = nodes.filter((n) => !n.isLeader && n.status === 'HEALTHY');
    if (activeWorkers.length === 0) {
      addLog('⚠️ No healthy worker nodes available to kill.');
      return;
    }
    const victim = activeWorkers[Math.floor(Math.random() * activeWorkers.length)];
    addLog(`💥 SIMULATION: Simulating sudden node crash on worker [${victim.nodeId}]...`);
    await onCrashWorker(victim.nodeId);
    addLog(`🚨 Node [${victim.nodeId}] declared DEAD. Leader FailoverManager will reassign orphaned jobs within 5s.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
              <span>Fault Tolerance & Resiliency Workbench</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Inject node failures and high job load bursts to test consensus, heartbeat timeout, and failover recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Action 1: High Load Spike */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Load Burst Injection</h3>
              <p className="text-xs text-slate-400">Triggers 5 concurrent job executions across workers</p>
            </div>
          </div>

          <button
            onClick={handleSimulateBurst}
            disabled={isSimulating}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>{isSimulating ? 'Injecting Load...' : 'Inject Job Burst (5x)'}</span>
          </button>
        </div>

        {/* Action 2: Node Crash Injection */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Skull className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simulate Node Crash</h3>
              <p className="text-xs text-slate-400">Instantly kills a healthy worker node during execution</p>
            </div>
          </div>

          <button
            onClick={handleKillRandomWorker}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Skull className="h-4 w-4" />
            <span>Kill Random Worker Node</span>
          </button>
        </div>

      </div>

      {/* Live Simulation Console */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Resiliency Workbench Activity Feed</span>
        </h3>

        <div className="font-mono text-xs max-h-60 overflow-y-auto space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          {logMessages.length === 0 ? (
            <div className="text-slate-600 italic">Click an action above to run resiliency test scenarios...</div>
          ) : (
            logMessages.map((msg, idx) => (
              <div key={idx} className="text-slate-300">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
