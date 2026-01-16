import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';

interface Props {
  apiUrl: string;
}

function ModeControls({ apiUrl }: Props) {
  const [dummyMode, setDummyMode] = useState(false);
  const [backendMode, setBackendMode] = useState('MESSAGES_ONLY');
  const [pushMessageType, setPushMessageType] = useState('ANSWER');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <Settings className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Mode Configuration</h2>
          <p className="text-sm text-slate-600">Control server behavior and message processing</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">Dummy Mode</h3>
              <p className="text-sm text-slate-600 mt-1">
                Generate random answers (A-D) for testing
              </p>
            </div>
            <button
              onClick={() => {
                const newValue = !dummyMode;
                setDummyMode(newValue);
                showNotification('success', `Dummy mode ${newValue ? 'enabled' : 'disabled'} (restart server to apply)`);
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                dummyMode ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  dummyMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-xs text-slate-500 bg-white rounded px-3 py-2 border border-slate-200">
            <span className="font-mono">DUMMY_MODE={dummyMode ? 'true' : 'false'}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Backend Mode</h3>
          <p className="text-sm text-slate-600 mb-4">
            Select the backend processing mode
          </p>
          <div className="space-y-2">
            {['MESSAGES_ONLY', 'FULL_PROCESSING', 'REPLAY'].map((mode) => (
              <label
                key={mode}
                className="flex items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="backendMode"
                  checked={backendMode === mode}
                  onChange={() => {
                    setBackendMode(mode);
                    showNotification('success', `Backend mode set to ${mode} (restart server to apply)`);
                  }}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-900 font-mono">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Push Message Type</h3>
          <p className="text-sm text-slate-600 mb-4">
            Choose what type of messages to broadcast
          </p>
          <div className="space-y-2">
            {['ANSWER', 'RAW'].map((type) => (
              <label
                key={type}
                className="flex items-center p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="pushMessageType"
                  checked={pushMessageType === type}
                  onChange={() => {
                    setPushMessageType(type);
                    showNotification('success', `Message type set to ${type} (restart server to apply)`);
                  }}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-slate-900 font-mono">{type}</span>
                  <p className="text-xs text-slate-500 mt-1">
                    {type === 'ANSWER' ? 'Only valid A-D answers' : 'All raw chat messages'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Note on Configuration</p>
              <p>
                These settings are displayed for monitoring. To apply changes, update your <span className="font-mono bg-amber-100 px-1 rounded">.env</span> file and restart the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeControls;
