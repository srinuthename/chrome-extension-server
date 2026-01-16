import { Activity, Database, Wifi, Clock } from 'lucide-react';

interface HealthData {
  status: string;
  wsClients: number;
  mongo: boolean;
  uptime: number;
}

interface Props {
  health: HealthData | null;
  apiUrl: string;
}

function HealthMonitor({ health }: Props) {
  if (!health) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-600">Loading health data...</span>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const stats = [
    {
      label: 'Server Status',
      value: health.status.toUpperCase(),
      icon: Activity,
      color: health.status === 'ok' ? 'text-green-500' : 'text-red-500',
      bgColor: health.status === 'ok' ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'WebSocket Clients',
      value: health.wsClients.toString(),
      icon: Wifi,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'MongoDB',
      value: health.mongo ? 'CONNECTED' : 'DISCONNECTED',
      icon: Database,
      color: health.mongo ? 'text-green-500' : 'text-red-500',
      bgColor: health.mongo ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Uptime',
      value: formatUptime(health.uptime),
      icon: Clock,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">System Health</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HealthMonitor;
