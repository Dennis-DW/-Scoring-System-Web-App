// hooks/useParticipants.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { generateAvatar } from '../utils/avatarUtils';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const processParticipantData = (data) => {
  if (!data) throw new Error('Empty response received');
  
  if (typeof data === 'string') {
    const jsonStart = data.indexOf('{');
    if (jsonStart === -1) throw new Error('Invalid JSON response');
    return JSON.parse(data.substring(jsonStart));
  }
  return data;
};

const calculateRanks = (participants) => {
  if (!Array.isArray(participants)) return () => null;
  
  const scores = [...new Set(participants
    .map(p => p?.stats?.average_score)
    .filter(score => typeof score === 'number')
    .sort((a, b) => b - a)
  )];
  return (score) => typeof score === 'number' ? scores.indexOf(score) + 1 : null;
};

const validateParticipant = (participant) => {
  return participant 
    && typeof participant === 'object'
    && typeof participant.name === 'string'
    && participant.stats
    && typeof participant.stats === 'object';
};

export const useParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (retryCount = 0) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/backend/api/get_participants.php`);
      const cleanData = processParticipantData(response.data);

      if (cleanData.success && Array.isArray(cleanData.participants)) {
        const validParticipants = cleanData.participants.filter(validateParticipant);
        const getRank = calculateRanks(validParticipants);
        
        const participantsWithAvatars = validParticipants.map(participant => ({
          ...participant,
          avatar: generateAvatar(participant.name),
          score: participant.stats.average_score || 0,
          rank: getRank(participant.stats.average_score),
          status: participant.stats.total_scores > 0 ? 'active' : 'pending',
        }));

        setParticipants(participantsWithAvatars);
      } else {
        throw new Error(cleanData.error || 'Invalid response format');
      }
    } catch (err) {
      if (retryCount < MAX_RETRIES && axios.isAxiosError(err) && !err.response) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetch(retryCount + 1);
      }

      setError('Failed to load participants');
      console.error('Participants fetch error:', {
        message: err.message,
        statusCode: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { participants, loading, error, fetch };
};