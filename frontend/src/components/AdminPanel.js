// components/AdminPanel.js
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [judges, setJudges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const response = await axios.get('/get_judges.php');
      setJudges(response.data.judges || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching judges' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/add_judge.php', {
        username: formData.username,
        display_name: formData.displayName,
        email: formData.email,
        password: formData.password
      });
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ username: '', displayName: '', email: '', password: '' });
      fetchJudges();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error adding judge'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJudge = async (judgeId) => {
    if (!window.confirm('Are you sure you want to delete this judge?')) return;
    
    try {
      await axios.delete(`/delete_judge.php?id=${judgeId}`);
      fetchJudges();
      setMessage({ type: 'success', text: 'Judge deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting judge' });
    }
  };

  const filteredJudges = judges.filter(judge => 
    judge.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-slate-800 mb-8">Admin Panel - Manage Judges</h2>

      {/* Add Judge Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Add New Judge</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Judge'}
          </button>
        </form>

        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Judges List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-700">Existing Judges</h3>
          <input
            type="text"
            placeholder="Search judges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredJudges.map((judge) => (
                  <tr key={judge.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {judge.display_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {judge.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {judge.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteJudge(judge.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredJudges.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No judges found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;