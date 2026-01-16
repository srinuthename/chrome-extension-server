import { useState } from 'react';
import { Play, SkipForward, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  apiUrl: string;
}

function QuizControls({ apiUrl }: Props) {
  const [streamIds, setStreamIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  async function handleStartQuiz() {
    setLoading(true);
    try {
      const streamIdArray = streamIds
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const res = await fetch(`${apiUrl}/admin/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamIds: streamIdArray }),
      });

      if (res.ok) {
        showNotification('success', 'Quiz started successfully!');
      } else {
        showNotification('error', 'Failed to start quiz');
      }
    } catch (error) {
      showNotification('error', 'Network error while starting quiz');
      console.error('Start quiz failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleNextQuestion() {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/next`, {
        method: 'POST',
      });

      if (res.ok) {
        showNotification('success', 'Moving to next question!');
      } else {
        showNotification('error', 'Failed to advance to next question');
      }
    } catch (error) {
      showNotification('error', 'Network error while advancing quiz');
      console.error('Next question failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-50 p-3 rounded-lg">
          <Play className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Quiz Controls</h2>
          <p className="text-sm text-slate-600">Start and manage quiz sessions</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500" />
            Start New Quiz
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Enter stream IDs to monitor (comma-separated), or leave empty to use defaults
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={streamIds}
              onChange={(e) => setStreamIds(e.target.value)}
              placeholder="stream1, stream2, stream3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <Play className="w-5 h-5" />
              {loading ? 'Starting...' : 'Start Quiz'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <SkipForward className="w-5 h-5 text-blue-500" />
            Advance to Next Question
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Trigger the reveal phase and move to the next question
          </p>
          <button
            onClick={handleNextQuestion}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <SkipForward className="w-5 h-5" />
            {loading ? 'Advancing...' : 'Next Question'}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3 text-sm">Quiz Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Question Time</span>
              <span className="font-mono font-medium text-slate-900">15 seconds</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Reveal Time</span>
              <span className="font-mono font-medium text-slate-900">8 seconds</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Mode</span>
              <span className="font-mono font-medium text-slate-900">Interactive</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How it works</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Click "Start Quiz" to initialize a new quiz session</li>
                <li>Messages will be collected during the question phase</li>
                <li>Click "Next Question" to reveal answers and advance</li>
                <li>Monitor real-time metrics in the Metrics tab</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizControls;
