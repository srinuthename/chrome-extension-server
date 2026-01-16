import { BarChart3, TrendingUp, Filter, CheckCircle } from 'lucide-react';

interface StreamMetrics {
  received: number;
  deduped: number;
  persisted: number;
  rejected: number;
}

interface Props {
  metrics: { [streamId: string]: StreamMetrics };
}

function MetricsDisplay({ metrics }: Props) {
  const streamIds = Object.keys(metrics);
  const totalMetrics = streamIds.reduce(
    (acc, streamId) => {
      const m = metrics[streamId];
      return {
        received: acc.received + m.received,
        deduped: acc.deduped + m.deduped,
        persisted: acc.persisted + m.persisted,
        rejected: acc.rejected + m.rejected,
      };
    },
    { received: 0, deduped: 0, persisted: 0, rejected: 0 }
  );

  const calculateRate = (count: number, total: number) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Message Metrics</h2>
            <p className="text-sm text-slate-600">Real-time message processing statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  Received
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {totalMetrics.received.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600">Total messages received</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  Persisted
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {totalMetrics.persisted.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-green-600">
              {calculateRate(totalMetrics.persisted, totalMetrics.received)}% of received
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                  Deduped
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {totalMetrics.deduped.toLocaleString()}
                </p>
              </div>
              <Filter className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xs text-amber-600">
              {calculateRate(totalMetrics.deduped, totalMetrics.received)}% filtered
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {totalMetrics.rejected.toLocaleString()}
                </p>
              </div>
              <Filter className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs text-red-600">
              {calculateRate(totalMetrics.rejected, totalMetrics.received)}% rejected
            </p>
          </div>
        </div>

        {streamIds.length === 0 ? (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No stream metrics available yet</p>
            <p className="text-sm text-slate-500 mt-1">Start receiving messages to see statistics</p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Stream ID
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Persisted
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Deduped
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Rejected
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {streamIds.map((streamId) => {
                    const m = metrics[streamId];
                    const successRate = calculateRate(m.persisted, m.received);
                    return (
                      <tr key={streamId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-slate-900">{streamId}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {m.received.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          {m.persisted.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-600 font-medium">
                          {m.deduped.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          {m.rejected.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            parseFloat(successRate) >= 80
                              ? 'bg-green-100 text-green-800'
                              : parseFloat(successRate) >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {successRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricsDisplay;
