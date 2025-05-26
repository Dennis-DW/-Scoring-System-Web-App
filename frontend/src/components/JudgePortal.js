import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecentScores from './RecentScores';

function JudgePortal() {
  const [data, setData] = useState({
    judges: [],
    participants: [],
    recentScores: [],
    categories: [],
  });
  const [form, setForm] = useState({
    judgeId: '',
    participantId: '',
    categoryId: '',
    points: '',
    comments: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching data...');
      setLoading(true);
      setMessage({ type: '', text: '' });

      const [judgesRes, participantsRes, scoresRes, categoriesRes] = await Promise.all([
        axios.get('/get_judges.php'),
        axios.get('/get_participants.php'),
        axios.get('/get_recent_scores.php'),
        axios.get('/get_categories.php'),
      ]);

      console.log('Raw responses:', { judgesRes, participantsRes, scoresRes, categoriesRes });

      const cleanData = {
        judges: processResponse(judgesRes.data)?.judges || [],
        participants: processResponse(participantsRes.data)?.participants || [],
        recentScores: processResponse(scoresRes.data)?.scores || [],
        categories: processResponse(categoriesRes.data)?.categories || [],
      };

      console.log('Processed data:', cleanData);
      setData(cleanData);
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage({
        type: 'error',
        text: 'Failed to load data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []); // fetchData has no dependencies, so it won't change

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]); // Now safe to include fetchData in the dependency array

  const processResponse = (data) => {
    if (typeof data === 'string') {
      const jsonStart = data.indexOf('{');
      return jsonStart !== -1 ? JSON.parse(data.substring(jsonStart)) : null;
    }
    return data;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.judgeId || !form.participantId || !form.categoryId || !form.points) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const points = parseInt(form.points);
    if (isNaN(points) || points < 1 || points > 100) {
      setMessage({ type: 'error', text: 'Score must be between 1 and 100' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let response = await axios.post('/submit_score.php', {
        judge_id: form.judgeId,
        participant_id: form.participantId,
        category_id: form.categoryId,
        points,
        comments: form.comments?.trim() || '',
      });

      // Clean response data
      const responseData =
        typeof response.data === 'string'
          ? JSON.parse(response.data.substring(response.data.indexOf('{')))
          : response.data;

      console.log('Clean response:', responseData);

      if (responseData.success) {
        // Reset form
        setForm((prev) => ({
          ...prev,
          points: '',
          comments: '',
          categoryId: '',
        }));

        setMessage({
          type: 'success',
          text: responseData.message || 'Score submitted successfully',
        });

        // Show score details
        console.log('Score details:', {
          points: responseData.score.points,
          weighted: responseData.score.weighted_points,
          category: responseData.score.category,
          participant: responseData.participant.name,
          stats: responseData.participant.stats,
        });

        await fetchData();
      } else {
        throw new Error(responseData.error || 'Failed to submit score');
      }
    } catch (err) {
      console.error('Submit error:', {
        name: err.name,
        message: err.message,
        response: err.response?.data,
      });

      let errorMessage = 'Failed to submit score';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          try {
            const cleanData = JSON.parse(err.response.data.substring(err.response.data.indexOf('{')));
            errorMessage = cleanData.error || cleanData.message || errorMessage;
          } catch (e) {
            errorMessage = err.response.data;
          }
        } else {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        }
      }

      setMessage({ type: 'error', text: errorMessage });
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Judge</label>
              <select
                name="judgeId"
                value={form.judgeId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Judge</option>
                {data.judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Participant</label>
              <select
                name="participantId"
                value={form.participantId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Participant</option>
                {data.participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Points (1-100)</label>
              <input
                type="number"
                name="points"
                value={form.points}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Comments</label>
              <textarea
                name="comments"
                value={form.comments}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
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
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <RecentScores />
    </div>
  );
}

export default JudgePortal;