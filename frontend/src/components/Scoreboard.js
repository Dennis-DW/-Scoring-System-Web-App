// components/Scoreboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';

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
      
      const response = await axios.get('/scores.php');
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
