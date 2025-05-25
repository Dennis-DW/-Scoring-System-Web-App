// components/JudgePortal.js
import { useState, useEffect } from 'react';
import axios from 'axios';

function JudgePortal() {
  const [judges, setJudges] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [judgeId, setJudgeId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [points, setPoints] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentScores, setRecentScores] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [judgesRes, participantsRes, scoresRes] = await Promise.all([
        axios.get('/get_judges.php'),
        axios.get('/get_participants.php'),
        axios.get('/get_recent_scores.php')
      ]);
      setJudges(judgesRes.data.judges || []);
      setParticipants(participantsRes.data.participants || []);
      setRecentScores(scoresRes.data.scores || []);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading data' });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/submit_score.php', {
        judge_id: judgeId,
        participant_id: participantId,
        points,
        comments
      });
      setMessage({ type: 'success', text: response.data.message });
      setPoints('');
      setComments('');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error submitting score'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold text-slate-800 mb-8">Judge Portal</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-6">Submit Score</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Judge
              </label>
              <select
                value={judgeId}
                onChange={(e) => setJudgeId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Judge</option>
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Participant
              </label>
              <select
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Participant</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Points (1-100)
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </div>
        </form>

        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Recent Scores */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-6">Recent Scores</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Judge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentScores.map((score) => (
                <tr key={score.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(score.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {score.judge_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {score.participant_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {score.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentScores.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No scores submitted yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JudgePortal;