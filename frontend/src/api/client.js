const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  getMetrics: () => request('/metrics'),
  getJobs: () => request('/jobs'),
  getJobById: (id) => request(`/jobs/${id}`),
  createJob: (jobData) => request('/jobs', { method: 'POST', body: JSON.stringify(jobData) }),
  updateJob: (id, jobData) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(jobData) }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
  triggerJob: (id) => request(`/jobs/${id}/trigger`, { method: 'POST' }),
  toggleJobStatus: (id) => request(`/jobs/${id}/toggle-status`, { method: 'POST' }),
  getExecutions: () => request('/jobs/executions'),
  getJobExecutions: (id) => request(`/jobs/${id}/executions`),
  getLogs: () => request('/jobs/logs'),
  getExecutionLogs: (executionId) => request(`/jobs/executions/${executionId}/logs`),
  getNodes: () => request('/nodes'),
  simulateNodeCrash: (nodeId) => request(`/nodes/${nodeId}/simulate-crash`, { method: 'POST' }),
  spawnWorkerNode: (nodeId, maxThreads = 5) => request(`/nodes/${nodeId}/spawn?maxThreads=${maxThreads}`, { method: 'POST' }),
};
