// New file: hooks/useParticipants.js
import { useState, useCallback } from 'react';
import api from '../config/axios';
import { generateAvatar } from '../utils/avatarUtils';

const processParticipantData = (data) => {
  if (typeof data === 'string') {
    const jsonStart = data.indexOf('{');
    return JSON.parse(data.substring(jsonStart));
  }
  return data;
};

const calculateRanks = (participants) => {
  const scores = [...new Set(participants
    .map(p => p.stats.average_score)
    .filter(Boolean)
    .sort((a, b) => b - a)
  )];
  return (score) => score ? scores.indexOf(score) + 1 : null;
};

export const useParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.get('/api/get_participants.php');
      const cleanData = processParticipantData(response.data);

      if (cleanData.success && cleanData.participants) {
        const getRank = calculateRanks(cleanData.participants);
        const participantsWithAvatars = cleanData.participants.map(participant => ({
          ...participant,
          avatar: generateAvatar(participant.name),
          score: participant.stats.average_score,
          rank: getRank(participant.stats.average_score),
          status: participant.stats.total_scores > 0 ? 'active' : 'pending',
        }));

        setParticipants(participantsWithAvatars);
      } else {
        throw new Error(cleanData.error || 'Invalid response format');
      }
    } catch (err) {
      setError('Failed to load participants');
      console.error('Participants fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { participants, loading, error, fetch };
};
