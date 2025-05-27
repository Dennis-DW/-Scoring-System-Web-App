// JudgePortal.js
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import RecentScores from './RecentScores';
import  LoadingSpinner from './LoadingSpinner';
import { useJudgePortalData } from '../hooks/useJudgePortalData';
import { useScoreSubmission } from '../hooks/useScoreSubmission';

function JudgePortal() {
  const { data, loading, fetch } = useJudgePortalData();
  const {
    form,
    submitting,
    message,
    handleInputChange,
    handleSubmit
  } = useScoreSubmission(() => fetch());

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  if (loading) return <LoadingSpinner />;

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

JudgePortal.propTypes = {
  data: PropTypes.shape({
    judges: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
    })),
    participants: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
    categories: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
  }),
};

export default JudgePortal;