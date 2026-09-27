import React, { useState } from 'react';
import { Plus, Play, Pause, Trash2, Edit3, Clock, AlertCircle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

export default function JobManager({ jobs, onOpenModal, onTrigger, onToggleStatus, onDelete }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [triggeringId, setTriggeringId] = useState(null);

  const filteredJobs = (jobs || []).filter((job) => {
    const matchesFilter =
      filter === 'ALL' ? true : filter === 'ACTIVE' ? job.status === 'ACTIVE' : job.status === 'PAUSED';
    const matchesSearch =
      job.name.toLowerCase().includes(search.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleManualTrigger = async (id) => {
    setTriggeringId(id);
    try {
      await onTrigger(id);
    } finally {
      setTimeout(() => setTriggeringId(null), 600);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Scheduled Job Registry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure CRON rules, execution payloads, priorities, and retry limits across worker nodes.
          </p>
        </div>

        <button
          onClick={() => onOpenModal(null)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-xs hover:from-sky-400 hover:to-cyan-400 transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {['ALL', 'ACTIVE', 'PAUSED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab} ({tab === 'ALL' ? jobs.length : jobs.filter((j) => j.status === tab).length})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter jobs by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
        />

      </div>

      {/* Job Cards / Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No job definitions found</p>
            <p className="text-slate-500 text-xs mt-1">Create a new CRON or interval job to start scheduling.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-3.5">Job Name</th>
                  <th className="px-4 py-3.5">Type & Schedule</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Next Execution</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Name & Desc */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100 text-sm">{job.name}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xs mt-0.5">{job.description}</div>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold text-[10px]">
                          {job.type}
                        </span>
                        <span className="text-slate-200">
                          {job.type === 'CRON' ? job.cronExpression : job.type === 'INTERVAL' ? `${job.intervalSeconds}s` : 'Once'}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                        job.priority >= 8
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : job.priority >= 5
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        P{job.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        job.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{job.status}</span>
                      </span>
                    </td>

                    {/* Next Run */}
                    <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                      {job.nextRunAt ? job.nextRunAt.replace('T', ' ').substring(0, 19) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        
                        {/* Run Now Trigger */}
                        <button
                          onClick={() => handleManualTrigger(job.id)}
                          disabled={triggeringId === job.id}
                          title="Trigger Immediate Run"
                          className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 transition-all"
                        >
                          <Zap className={`h-3.5 w-3.5 ${triggeringId === job.id ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Pause / Resume */}
                        <button
                          onClick={() => onToggleStatus(job.id)}
                          title={job.status === 'ACTIVE' ? 'Pause Schedule' : 'Resume Schedule'}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                        >
                          {job.status === 'ACTIVE' ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onOpenModal(job)}
                          title="Edit Job Definition"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDelete(job.id)}
                          title="Delete Job"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
