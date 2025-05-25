// components/AdminPanel.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JudgesList from './JudgesList';

const toastConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const errorToastConfig = {
  ...toastConfig,
  autoClose: 5000,
};

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

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/get_judges.php');
      const cleanData = typeof response.data === 'string'
        ? JSON.parse(response.data.substring(response.data.indexOf('{')))
        : response.data;

      if (cleanData.success) {
        const formattedJudges = cleanData.judges.map(judge => ({
          id: judge.id,
          username: judge.username,
          displayName: judge.display_name,
          email: judge.email,
          role: judge.role_name,
          isActive: judge.is_active,
          stats: {
            scoresGiven: judge.stats?.scores_given || 0,
            participantsScored: judge.stats?.participants_scored || 0,
            lastActivity: judge.stats?.last_activity
          }
        }));
        setJudges(formattedJudges);
      }
    } catch (err) {
      toast.error('Failed to load judges');
      console.error('Fetch judges error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const loadingToast = toast.loading('Adding judge...', toastConfig);

    try {
      const response = await axios.post(
        '/add_judge.php',
        {
          username: formData.username,
          display_name: formData.displayName,
          email: formData.email,
          password: formData.password,
          role_id: 2
        }
      );

      if (response.data.success) {
        setFormData({
          username: '',
          displayName: '',
          email: '',
          password: ''
        });

        toast.update(loadingToast, {
          render: '🎉 Judge added successfully!',
          type: 'success',
          isLoading: false,
          ...toastConfig
        });

        setMessage({
          type: 'success',
          text: response.data.message || 'Judge added successfully'
        });
        await fetchJudges();
      }
    } catch (err) {
      const errors = err.response?.data?.errors;

      toast.update(loadingToast, {
        render: (
          <div>
            <h4 className="font-semibold">Failed to add judge</h4>
            {errors && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        ),
        type: 'error',
        isLoading: false,
        ...errorToastConfig
      });

      setMessage({
        type: 'error',
        text: 'Failed to add judge',
        errors
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field, direction) => {
    const sortedJudges = [...judges].sort((a, b) => {
      const aValue = a[field]?.toLowerCase();
      const bValue = b[field]?.toLowerCase();
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    setJudges(sortedJudges);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-slate-800 mb-8">Admin Panel - Manage Judges</h2>

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
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
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
              {message.errors && (
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(message.errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <JudgesList 
          judges={judges}
          loading={loading}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}

export default AdminPanel;