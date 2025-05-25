// components/Overview.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './cards/StatCard';

const Overview = () => {
  const [stats, setStats] = useState({
    overview: {
      active_participants: 0,
      active_judges: 0,
      active_categories: 0,
      total_scores: 0
    },
    categories: [],
    judge_activity: [],
    top_participants: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


const fetchStats = async () => {
  try {
    console.log('Fetching statistics...');
    setError(null);
    
    const response = await axios.get('/get_stats.php');
    console.log('Raw API response:', response.data);

    // Remove "Connected successfully" messages if present
    let cleanData;
    if (typeof response.data === 'string') {
      const jsonStart = response.data.indexOf('{');
      const jsonString = response.data.substring(jsonStart);
      cleanData = JSON.parse(jsonString);
    } else {
      cleanData = response.data;
    }

    console.log('Cleaned data:', cleanData);

    if (cleanData.success && cleanData.stats) {
      // Use the overview data directly from API response
      const overviewStats = cleanData.stats.overview || {
        active_participants: 0,
        active_judges: 0,
        active_categories: 0,
        total_scores: 0
      };

      console.log('Overview stats:', overviewStats);
      
      setStats({
        overview: overviewStats,
        categories: cleanData.stats.categories || [],
        judge_activity: cleanData.stats.judge_activity || [],
        top_participants: cleanData.stats.top_participants || [],
        recent_activity: cleanData.stats.recent_activity || []
      });
    } else {
      throw new Error(cleanData.error || 'Invalid response format');
    }
  } catch (err) {
    console.error('Stats fetch error:', {
      message: err.message,
      raw: err,
      response: err.response?.data
    });
    setError('Failed to load statistics');
  } finally {
    setLoading(false);
    console.log('Fetch completed');
  }
};

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statsData = [
    {
      value: stats.overview?.active_participants || 0,
      label: 'Participants',
      icon: (
        <svg className="bi bi-people-fill inline-block size-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
        </svg>
      ),
      subtext: 'Active participants',
      loading
    },
    {
      value: stats.overview?.active_judges || 0,
      label: 'Judges',
      icon: (
        <svg className="bi bi-person-badge inline-block size-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0h-7zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492V2.5z"/>
        </svg>
      ),
      subtext: 'Active judges',
      loading
    },
    {
      value: stats.overview?.total_scores || 0,
      label: 'Scores',
      icon: (
        <svg className="bi bi-clipboard-data inline-block size-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4 11a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1zm6-4a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V7zM7 9a1 1 0 0 1 2 0v3a1 1 0 1 1-2 0V9z"/>
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
      ),
      subtext: 'Total scores submitted',
      loading
    },
    {
      value: stats.overview?.active_categories || 0,
      label: 'Categories',
      icon: (
        <svg className="bi bi-graph-up inline-block size-4 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
        </svg>
      ),
      subtext: 'Active categories',
      loading
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-slate-800">Overview</h2>
          <h3 className="text-sm font-medium text-slate-500 mt-2">
            Competition Statistics Dashboard
          </h3>
        </div>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : (
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default Overview;