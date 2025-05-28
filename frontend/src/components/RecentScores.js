// src/components/RecentScores.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

/**
 * RecentScores Component
 * 
 * This component fetches and displays a list of recent scores from the server.
 * It periodically refreshes the data based on the provided refresh interval.
 * 
 * Props:
 * @param {number} [refreshInterval=30000] - The interval (in milliseconds) at which the scores are refreshed.
 * 
 * State:
 * @typedef {Object} DataState
 * @property {boolean} loading - Indicates whether the data is currently being loaded.
 * @property {Array<Object>} scores - The list of recent scores fetched from the server.
 * @property {string|null} error - An error message if the data fetch fails, otherwise null.
 * 
 * @type {DataState}
 * 
 * Features:
 * - Displays a loading spinner while fetching data.
 * - Shows an error message if the data fetch fails.
 * - Renders a table of recent scores with details such as time, judge, participant, category, points, and comments.
 * - Displays a message if no scores are available.
 * - Automatically refreshes the scores at the specified interval.
 * 
 * Dependencies:
 * - `axios` for making HTTP requests.
 * - `useState` and `useEffect` hooks from React for managing state and side effects.
 * - Tailwind CSS classes for styling.
 * 
 * @returns {JSX.Element} The rendered RecentScores component.
 */
const RecentScores = ({ refreshInterval = 30000 }) => {
  const [data, setData] = useState({
    loading: true,
    scores: [],
    error: null
  });

  const fetchScores = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get_recent_scores.php`);
      
      // Clean response data
      const responseData = typeof response.data === 'string' 
        ? JSON.parse(response.data.substring(response.data.indexOf('{')))
        : response.data;

      if (responseData.success) {
        setData({
          loading: false,
          scores: responseData.scores,
          error: null
        });
      } else {
        throw new Error(responseData.error || 'Failed to fetch scores');
      }
    } catch (err) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-600">{data.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-slate-700 mb-6">Recent Scores</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Judge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Participant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.scores.map((score) => (
              <tr key={score.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(score.score.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {score.judge.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {score.participant.name}
                  <span className="ml-2 text-xs text-slate-500">
                    ({score.participant.registration})
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {score.category.name}
                  {score.category.weight > 1 && (
                    <span className="ml-2 text-xs text-slate-500">
                      (x{score.category.weight})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {score.score.points}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {score.score.comments}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.scores.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No scores submitted yet
          </div>
        )}
      </div>
    </div>
  );
};

RecentScores.propTypes = {
  refreshInterval: PropTypes.number
};

export default RecentScores;