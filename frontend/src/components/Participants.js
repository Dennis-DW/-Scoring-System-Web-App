// components/Participants.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from './cards/UserCard';
import { generateAvatar } from '../utils/avatarUtils';

/**
 * Participants Component
 * 
 * This component displays a list of participants with features such as sorting, searching, and refreshing.
 * It fetches participant data from an API, processes it, and renders it in a grid layout.
 * 
 * State Variables:
 * - `participants`: Array of participant objects with additional computed properties like avatar, rank, and status.
 * - `loading`: Boolean indicating whether data is being fetched.
 * - `error`: String containing error messages, if any.
 * - `searchTerm`: String used to filter participants by name, email, or registration.
 * - `sortBy`: Field by which participants are sorted (e.g., "average_score", "name", "total_scores").
 * - `sortOrder`: Sorting order, either "asc" (ascending) or "desc" (descending).
 * 
 * Functions:
 * - `fetchParticipants`: Fetches participant data from the API, processes it, and updates the state.
 * - `calculateRank`: Calculates the rank of a participant based on their average score.
 * - `handleSort`: Toggles sorting order or changes the sorting field.
 * - `getSortValue`: Retrieves the value of a participant's field for sorting purposes.
 * 
 * Effects:
 * - `useEffect`: Fetches participants on component mount and sets up a 30-second interval for refreshing data.
 * 
 * Rendered Elements:
 * - Header: Displays the title and the number of participants currently shown.
 * - Controls: Includes sorting dropdown, search input, and a refresh button.
 * - Error Message: Displays an error message if data fetching fails.
 * - Participant Grid: Displays participant cards with details like name, score, rank, and status.
 * - Empty State: Shown when no participants match the search or when the list is empty.
 * 
 * Props for `UserCard` Component:
 * - `avatar`: URL or placeholder for the participant's avatar.
 * - `name`: Participant's name.
 * - `email`: Participant's email address.
 * - `registration`: Participant's registration details.
 * - `projectName`: A string indicating the participant's current standing.
 * - `score`: Participant's average score.
 * - `totalScores`: Total number of scores received by the participant.
 * - `judgesCount`: Number of judges who scored the participant.
 * - `lastScored`: Timestamp of the last score received.
 * - `status`: Status of the participant (e.g., "active" or "pending").
 * - `onView`: Callback function to navigate to the participant's detailed view.
 * 
 * Notes:
 * - The component handles API responses that may include extraneous messages (e.g., "Connected successfully").
 * - Sorting supports both numeric and string fields.
 * - The refresh button is disabled while data is being fetched.
 */
const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('average_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchParticipants = async () => {
    try {
      console.log('Fetching participants...');
      setError(null);
      setLoading(true);
      
      const response = await axios.get('/get_participants.php');
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
  
      if (cleanData.success && cleanData.participants) {
        const participantsWithAvatars = cleanData.participants.map(participant => ({
          ...participant,
          avatar: generateAvatar(participant.name),
          score: participant.stats.average_score,
          rank: calculateRank(participant.stats.average_score),
          status: participant.stats.total_scores > 0 ? 'active' : 'pending'
        }));
  
        console.log('Processed participants:', participantsWithAvatars);
        
        setParticipants(participantsWithAvatars);
        setError(null);
      } else {
        throw new Error(cleanData.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Participants fetch error:', {
        message: err.message,
        raw: err,
        response: err.response?.data
      });
      setError('Failed to load participants');
    } finally {
      setLoading(false);
      console.log('Fetch completed');
    }
  };

  const calculateRank = (score) => {
    if (!score) return null;
    const sortedScores = [...new Set(participants
      .map(p => p.stats.average_score)
      .filter(Boolean)
      .sort((a, b) => b - a)
    )];
    return sortedScores.indexOf(score) + 1;
  };

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 30000);
    return () => clearInterval(interval);
  }, []);

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
            onClick={fetchParticipants}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                onClick={fetchParticipants}
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

export default Participants;