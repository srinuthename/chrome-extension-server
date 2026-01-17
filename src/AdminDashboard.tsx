import { useEffect, useState } from 'react';
import { Activity, Users, MessageSquare, Settings, Play, SkipForward, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import HealthMonitor from './components/HealthMonitor';
import ModeControls from './components/ModeControls';
import UserBanPanel from './components/UserBanPanel';
import MetricsDisplay from './components/MetricsDisplay';
import QuizControls from './components/QuizControls';
import SSEMonitor from './components/SSEMonitor';

interface HealthData {
  status: string;
  wsClients: number;
  mongo: boolean;
  uptime: number;
}

interface Metrics {
  [streamId: string]: {
    received: number;
    deduped: number;
    persisted: number;
    rejected: number;
  };
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'health' | 'modes' | 'bans' | 'metrics' | 'quiz'>('health');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchHealth();
    fetchMetrics();

    const healthInterval = setInterval(fetchHealth, 5000);
    const metricsInterval = setInterval(fetchMetrics, 10000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setHealth(data);
      setIsConnected(true);
      setLastUpdate(new Date());
    } catch (error) {
      setIsConnected(false);
      console.error('Health check failed:', error);
    }
  }

  async function fetchMetrics() {
    try {
      const res = await fetch(`${API_URL}/metrics`);
      if (!res.ok) {
        console.warn(`Metrics endpoint returned ${res.status}`);
        setMetrics({});
        return;
      }
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Metrics fetch failed:', error);
      setMetrics({});
    }
  }

  const tabs = [
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'modes', label: 'Modes', icon: Settings },
    { id: 'bans', label: 'Bans', icon: Users },
    { id: 'metrics', label: 'Metrics', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz', icon: Play },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">YouTube Quiz Admin</h1>
              <p className="text-sm text-slate-600 mt-1">Real-time monitoring and control</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => { fetchHealth(); fetchMetrics(); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-700">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-700">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {lastUpdate && (
            <p className="text-xs text-slate-500 mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
                activeTab === id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'health' && (
            <>
              <HealthMonitor health={health} apiUrl={API_URL} />
              <SSEMonitor apiUrl={API_URL} />
            </>
          )}

          {activeTab === 'modes' && <ModeControls apiUrl={API_URL} />}

          {activeTab === 'bans' && <UserBanPanel apiUrl={API_URL} />}

          {activeTab === 'metrics' && <MetricsDisplay metrics={metrics} />}

          {activeTab === 'quiz' && <QuizControls apiUrl={API_URL} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
