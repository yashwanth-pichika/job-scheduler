import React, { useState, useEffect } from 'react';
import { X, Calendar, Layers, Clock, AlertTriangle } from 'lucide-react';

export default function JobModal({ isOpen, onClose, onSave, editingJob }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'INTERVAL',
    cronExpression: '0 */5 * * * *',
    intervalSeconds: 10,
    payload: '{"task": "sample_task", "data": "demo"}',
    priority: 5,
    maxRetries: 3,
    timeoutSeconds: 60,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingJob) {
      setFormData({
        name: editingJob.name || '',
        description: editingJob.description || '',
        type: editingJob.type || 'INTERVAL',
        cronExpression: editingJob.cronExpression || '0 */5 * * * *',
        intervalSeconds: editingJob.intervalSeconds || 10,
        payload: editingJob.payload || '{}',
        priority: editingJob.priority || 5,
        maxRetries: editingJob.maxRetries || 3,
        timeoutSeconds: editingJob.timeoutSeconds || 60,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'INTERVAL',
        cronExpression: '0 */5 * * * *',
        intervalSeconds: 10,
        payload: '{"task": "sample_task", "data": "demo"}',
        priority: 5,
        maxRetries: 3,
        timeoutSeconds: 60,
      });
    }
    setError('');
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Job name is required.');
      return;
    }
    try {
      JSON.parse(formData.payload);
    } catch {
      setError('Payload must be valid JSON format.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <span>{editingJob ? 'Edit Scheduled Job' : 'Create New Distributed Job'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Job Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Job Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Analytics Metrics Aggregator"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of task payload and target..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Schedule Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Schedule Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="INTERVAL">INTERVAL (Fixed Seconds)</option>
                <option value="CRON">CRON (Cron Expression)</option>
                <option value="ONE_TIME">ONE_TIME (Run Once)</option>
              </select>
            </div>

            {formData.type === 'CRON' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cron Expression</label>
                <input
                  type="text"
                  value={formData.cronExpression}
                  onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                  placeholder="0 */5 * * * *"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : formData.type === 'INTERVAL' ? (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Interval (Seconds)</label>
                <input
                  type="number"
                  value={formData.intervalSeconds}
                  onChange={(e) => setFormData({ ...formData, intervalSeconds: parseInt(e.target.value) || 10 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  min="1"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Single Run</label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-950 text-slate-500 font-mono">Immediate Trigger</div>
              </div>
            )}
          </div>

          {/* Priority & Retries */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority (1-10)</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Retries</label>
              <input
                type="number"
                value={formData.maxRetries}
                onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) || 3 })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Timeout (s)</label>
              <input
                type="number"
                value={formData.timeoutSeconds}
                onChange={(e) => setFormData({ ...formData, timeoutSeconds: parseInt(e.target.value) || 60 })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                min="5"
              />
            </div>
          </div>

          {/* JSON Payload */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Execution Payload (JSON)</label>
            <textarea
              rows={3}
              value={formData.payload}
              onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 shadow-lg shadow-sky-500/20"
            >
              {editingJob ? 'Save Changes' : 'Create Job'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
