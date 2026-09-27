import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import JobManager from './components/JobManager';
import JobModal from './components/JobModal';
import ClusterTopology from './components/ClusterTopology';
import ExecutionLogs from './components/ExecutionLogs';
import FailoverSimulator from './components/FailoverSimulator';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [m, j, e, n, l] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getJobs().catch(() => []),
        api.getExecutions().catch(() => []),
        api.getNodes().catch(() => []),
        api.getLogs().catch(() => []),
      ]);

      if (m) setMetrics(m);
      if (j) setJobs(j);
      if (e) setExecutions(e);
      if (n) setNodes(n);
      if (l) setLogs(l);
      setIsConnected(true);
    } catch (err) {
      console.error('Fetch error:', err);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Job Actions
  const handleCreateOrUpdateJob = async (formData) => {
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, formData);
      } else {
        await api.createJob(formData);
      }
      setIsModalOpen(false);
      setEditingJob(null);
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Error saving job');
    }
  };

  const handleTriggerJob = async (id) => {
    try {
      await api.triggerJob(id);
      fetchAllData();
    } catch (err) {
      alert('Failed to trigger job: ' + err.message);
    }
  };

  const handleToggleJobStatus = async (id) => {
    try {
      await api.toggleJobStatus(id);
      fetchAllData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job definition?')) {
      try {
        await api.deleteJob(id);
        fetchAllData();
      } catch (err) {
        alert('Failed to delete job: ' + err.message);
      }
    }
  };

  // Node Actions
  const handleSpawnWorker = async (nodeId, maxThreads = 5) => {
    try {
      await api.spawnWorkerNode(nodeId, maxThreads);
      fetchAllData();
    } catch (err) {
      alert('Failed to spawn worker: ' + err.message);
    }
  };

  const handleCrashWorker = async (nodeId) => {
    try {
      await api.simulateNodeCrash(nodeId);
      fetchAllData();
    } catch (err) {
      alert('Failed to crash worker: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        isConnected={isConnected}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'overview' && (
          <MetricsOverview
            metrics={metrics}
            executions={executions}
            nodes={nodes}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'jobs' && (
          <JobManager
            jobs={jobs}
            onOpenModal={(job) => {
              setEditingJob(job);
              setIsModalOpen(true);
            }}
            onTrigger={handleTriggerJob}
            onToggleStatus={handleToggleJobStatus}
            onDelete={handleDeleteJob}
          />
        )}

        {activeTab === 'topology' && (
          <ClusterTopology
            nodes={nodes}
            onSpawnWorker={handleSpawnWorker}
            onCrashWorker={handleCrashWorker}
          />
        )}

        {activeTab === 'logs' && (
          <ExecutionLogs
            logs={logs}
            executions={executions}
          />
        )}

        {activeTab === 'failover' && (
          <FailoverSimulator
            nodes={nodes}
            jobs={jobs}
            onTriggerJob={handleTriggerJob}
            onCrashWorker={handleCrashWorker}
            onSpawnWorker={handleSpawnWorker}
          />
        )}

      </main>

      {/* Modal Dialog */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleCreateOrUpdateJob}
        editingJob={editingJob}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Distributed Job Scheduler • Spring Boot 3.3 & React • Fault-Tolerant Engine
      </footer>

    </div>
  );
}
