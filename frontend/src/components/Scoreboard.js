// components/Scoreboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Scoreboard Component
 * 
 * This component displays a public scoreboard with participant rankings, scores, and other details.
 * It fetches data from the server, supports sorting by average score or total points, 
 * and updates the scoreboard periodically.
 * 
 * State Variables:
 * - `scores`: Array of score objects fetched from the server.
 * - `loading`: Boolean indicating whether the data is still being loaded.
 * - `error`: String containing an error message if the fetch operation fails.
 * - `sortBy`: Field by which the scores are sorted ('average_score' or 'total_points').
 * - `sortOrder`: Order of sorting ('asc' for ascending, 'desc' for descending).
 * 
 * Effects:
 * - Fetches scores from the server on component mount and every 5 seconds thereafter.
 * - Handles errors during the fetch operation and updates the UI accordingly.
 * 
 * Sorting:
 * - Users can toggle sorting by clicking on the column headers for "Average Score" or "Total Points".
 * - Sorting order toggles between ascending and descending when the same column is clicked repeatedly.
 * 
 * Rendered Output:
 * - Displays a loading spinner while fetching data.
 * - Shows an error message if the fetch operation fails.
 * - Renders a table with participant rankings, scores, and other details.
 * - Highlights participants based on their average score (green for >= 75, blue for >= 50, default otherwise).
 * - Displays "No scores available yet" if the scores array is empty.
 * 
 * @component
 */
function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('average_score');
  const [sortOrder, setSortOrder] = useState('desc');


useEffect(() => {
  const fetchScores = async () => {
    try {
      console.log('Fetching scores...');
      setError(null);
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/backend/api/scores.php`);
      // console.log('Raw response:', response.data);

      // Extract JSON from response that contains extra messages
      const jsonStr = response.data.substring(
        response.data.indexOf('{'),
        response.data.lastIndexOf('}') + 1
      );
      
      const data = JSON.parse(jsonStr);
      // console.log('Parsed data:', data);

      if (data.success) {
        setScores(data.scores || []);
        console.log('Scores set:', data.scores);
      } else {
        throw new Error(data.error || 'Failed to fetch scores');
      }
    } catch (error) {
      // console.error('Error details:', {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status
      // });
      setError('Failed to fetch scores');
    } finally {
      console.log('Fetch operation completed');
      setLoading(false);
    }
  };

  fetchScores();
  const interval = setInterval(fetchScores, 5000);
  return () => clearInterval(interval);
}, []);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedScores = [...scores].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return multiplier * (
      sortBy === 'average_score' 
        ? (b.stats?.average_score || 0) - (a.stats?.average_score || 0)
        : (b.stats?.total_points || 0) - (a.stats?.total_points || 0)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-semibold text-slate-800 mb-6">Public Scoreboard</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Participant</th>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSort('average_score')}
              >
                Average Score
                {sortBy === 'average_score' && (
                  <span className="ml-2">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSort('total_points')}
              >
                Total Points
                {sortBy === 'total_points' && (
                  <span className="ml-2">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Judges</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Last Scored</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedScores.map((score, index) => (
              <tr 
                key={score.id}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-sm text-slate-600">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{score.name}</div>
                      <div className="text-sm text-slate-500">{score.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div 
                      className={`text-sm font-semibold ${
                        score.stats.average_score >= 75 ? 'text-green-600' :
                        score.stats.average_score >= 50 ? 'text-blue-600' :
                        'text-slate-600'
                      }`}
                    >
                      {score.stats.average_score.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {score.stats.total_points}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {score.stats.number_of_judges}
                  {score.stats.total_scores > 0 && (
                    <span className="text-slate-400">
                      {` (${score.stats.total_scores} scores)`}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {score.stats.last_scored 
                    ? new Date(score.stats.last_scored).toLocaleString()
                    : 'Never'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {scores.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No scores available yet
        </div>
      )}
    </div>
  );
}

export default Scoreboard;
