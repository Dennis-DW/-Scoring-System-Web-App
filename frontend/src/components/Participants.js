// Participants.js
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParticipants } from '../hooks/useParticipants';
import UserCard from './cards/UserCard';
import LoadingSpinner from './LoadingSpinner';
import RefreshIcon from './icons/RefreshIcon'


const Participants = () => {
  const { participants, loading, error, fetch } = useParticipants();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('average_score');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortValue = (participant, field) => {
    switch (field) {
      case 'average_score':
        return participant.stats.average_score || 0;
      case 'name':
        return participant.name;
      case 'total_scores':
        return participant.stats.total_scores;
      default:
        return participant[field];
    }
  };

  const filteredAndSortedParticipants = participants
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registration?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      return multiplier * (
        typeof aValue === 'string'
          ? aValue.localeCompare(bValue)
          : (bValue || 0) - (aValue || 0)
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-slate-800">Participants</h2>
          <h3 className="text-sm font-medium text-slate-500 mt-2">
            Currently showing <span className="font-semibold">{filteredAndSortedParticipants.length} participants</span>
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="average_score">Score</option>
              <option value="name">Name</option>
              <option value="total_scores">Total Scores</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={fetch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : <RefreshIcon />}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
            <div className="ml-auto pl-3">
              <button
                onClick={fetch}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <UserCard key={i} loading={true} />
          ))
        ) : (
          filteredAndSortedParticipants.map((participant) => (
            <UserCard
              key={participant.id}
              avatar={participant.avatar}
              name={participant.name}
              email={participant.email}
              registration={participant.registration}
              projectName={`Current Standing: ${
                participant.rank ? `#${participant.rank}` : 'Not ranked'
              }`}
              score={participant.stats.average_score}
              totalScores={participant.stats.total_scores}
              judgesCount={participant.stats.judges_count}
              lastScored={participant.stats.last_scored}
              status={participant.status}
              onView={() => window.location.href = `/participant/${participant.id}`}
            />
          ))
        )}
      </div>

      {!loading && filteredAndSortedParticipants.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No participants found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Waiting for participants to be added'}
          </p>
        </div>
      )}
    </div>
  );
};

UserCard.propTypes = {
  loading: PropTypes.bool,
  avatar: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  registration: PropTypes.string,
  projectName: PropTypes.string,
  score: PropTypes.number,
  totalScores: PropTypes.number,
  judgesCount: PropTypes.number,
  lastScored: PropTypes.string,
  status: PropTypes.string,
  onView: PropTypes.func
};

export default Participants;