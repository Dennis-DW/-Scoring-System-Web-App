// hooks/useParticipants.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { generateAvatar } from '../utils/avatarUtils';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const validateParticipant = (participant) => {
  return participant 
    && typeof participant.id === 'number'
    && typeof participant.name === 'string'
    && typeof participant.stats === 'object'
    && typeof participant.stats.average_score === 'number';
};

const processParticipantData = (data) => {
  try {
    if (typeof data === 'string') {
      const jsonStart = data.indexOf('{');
      if (jsonStart === -1) throw new Error('Invalid JSON response');
      return JSON.parse(data.substring(jsonStart));
    }
    return data;
  } catch (error) {
    throw new Error(`Failed to parse response: ${error.message}`);
  }
};

const calculateRanks = (participants) => {
  const scores = [...new Set(participants
    .map(p => p.stats.average_score)
    .filter(score => typeof score === 'number')
    .sort((a, b) => b - a)
  )];
  return (score) => typeof score === 'number' ? scores.indexOf(score) + 1 : null;
};

export const useParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithRetry = async (retries = 0) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/backend/api/get_participants.php`,
        { timeout: 5000 }
      );
      
      const cleanData = processParticipantData(response.data);
      
      if (!cleanData.success || !Array.isArray(cleanData.participants)) {
        throw new Error('Invalid response format');
      }

      if (!cleanData.participants.every(validateParticipant)) {
        throw new Error('Invalid participant data received');
      }

      const getRank = calculateRanks(cleanData.participants);
      return cleanData.participants.map(participant => ({
        ...participant,
        avatar: generateAvatar(participant.name),
        score: participant.stats.average_score,
        rank: getRank(participant.stats.average_score),
        status: participant.stats.total_scores > 0 ? 'active' : 'pending',
      }));

    } catch (err) {
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(retries + 1);
      }
      throw err;
    }
  };

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const participantsWithAvatars = await fetchWithRetry();
      setParticipants(participantsWithAvatars);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load participants');
      console.error('Participants fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { participants, loading, error, fetch };
};
