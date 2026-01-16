import { useState, useEffect, useRef } from 'react';
import { Radio, Circle, MessageCircle } from 'lucide-react';

interface SSEEvent {
  id: string;
  type: string;
  author?: string;
  answer?: string;
  receivedAt?: string;
}

interface Props {
  apiUrl: string;
}

function SSEMonitor({ apiUrl }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEventCount(prev => prev + 1);
        setEvents(prev => [data, ...prev].slice(0, 50));
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  const clearEvents = () => {
    setEvents([]);
    setEventCount(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`${isConnected ? 'bg-green-50' : 'bg-red-50'} p-3 rounded-lg`}>
            <Radio className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">SSE Connection Monitor</h2>
            <div className="flex items-center gap-2 mt-1">
              <Circle
                className={`w-2 h-2 ${isConnected ? 'text-green-500 fill-green-500 animate-pulse' : 'text-red-500 fill-red-500'}`}
              />
              <p className="text-sm text-slate-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Events Received</p>
            <p className="text-2xl font-bold text-slate-900">{eventCount}</p>
          </div>
          <button
            onClick={clearEvents}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Recent Events
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No events received yet</p>
              <p className="text-sm text-slate-500 mt-1">
                {isConnected ? 'Waiting for messages...' : 'Connecting to event stream...'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {events.map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="px-4 py-3 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          event.type === 'ANSWER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {event.type}
                        </span>
                        {event.author && (
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {event.author}
                          </span>
                        )}
                      </div>
                      {event.answer && (
                        <div className="mt-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded font-bold text-sm">
                            {event.answer}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 font-mono">
                        {event.receivedAt
                          ? new Date(event.receivedAt).toLocaleTimeString()
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {event.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isConnected && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            Live streaming enabled - Events will appear here in real-time
          </p>
        </div>
      )}
    </div>
  );
}

export default SSEMonitor;
