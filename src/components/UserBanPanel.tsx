import { useState, useEffect } from 'react';
import { UserX, Plus, Trash2, Search, AlertCircle } from 'lucide-react';

interface BannedUser {
  _id: string;
  author: string;
  bannedAt?: string;
}

interface Props {
  apiUrl: string;
}

function UserBanPanel({ apiUrl }: Props) {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  async function fetchBannedUsers() {
    try {
      const res = await fetch(`${apiUrl}/admin/bans`);
      const data = await res.json();
      setBannedUsers(data);
    } catch (error) {
      showNotification('error', 'Failed to fetch banned users');
      console.error('Fetch banned users failed:', error);
    }
  }

  async function banUser(author: string) {
    if (!author.trim()) {
      showNotification('error', 'Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/bans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim() }),
      });

      if (res.ok) {
        showNotification('success', `Banned user: ${author}`);
        setNewUserName('');
        await fetchBannedUsers();
      } else {
        const data = await res.json();
        showNotification('error', data.error || 'Failed to ban user');
      }
    } catch (error) {
      showNotification('error', 'Network error while banning user');
      console.error('Ban user failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function unbanUser(id: string, author: string) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/bans/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showNotification('success', `Unbanned user: ${author}`);
        await fetchBannedUsers();
      } else {
        showNotification('error', 'Failed to unban user');
      }
    } catch (error) {
      showNotification('error', 'Network error while unbanning user');
      console.error('Unban user failed:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = bannedUsers.filter(user =>
    user.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-50 p-3 rounded-lg">
          <UserX className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Ban Management</h2>
          <p className="text-sm text-slate-600">Block users from submitting messages</p>
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

      <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 mb-6">
        <h3 className="font-semibold text-slate-900 mb-3">Ban New User</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && banUser(newUserName)}
            placeholder="Enter username to ban"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            onClick={() => banUser(newUserName)}
            disabled={loading || !newUserName.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Ban User
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search banned users..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Banned At
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    {searchTerm ? 'No users match your search' : 'No banned users'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{user.author}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {user.bannedAt ? new Date(user.bannedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => unbanUser(user._id, user.author)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Unban
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Total banned users: {bannedUsers.length}</span>
        {searchTerm && (
          <span>Showing {filteredUsers.length} of {bannedUsers.length}</span>
        )}
      </div>
    </div>
  );
}

export default UserBanPanel;
