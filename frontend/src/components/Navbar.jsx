import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Server, Terminal, ShieldAlert, Clock, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, metrics, isConnected }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'jobs', label: 'Job Manager', icon: Layers },
    { id: 'topology', label: 'Cluster Topology', icon: Server },
    { id: 'logs', label: 'Live Logs', icon: Terminal },
    { id: 'failover', label: 'Resiliency Test', icon: ShieldAlert },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  DISTRIBUTED<span className="text-sky-400">SCHEDULER</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v1.0-JAVA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Leader-Worker Cluster Coordinator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>{time}</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
              <span className="text-xs font-medium text-slate-300">
                {isConnected ? 'CLUSTER ONLINE' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-slate-800/50 bg-slate-950/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
