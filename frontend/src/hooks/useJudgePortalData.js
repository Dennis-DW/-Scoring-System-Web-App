// hooks/useJudgePortalData.js
import { useState, useCallback } from 'react';
import api from '../config/axios';

const processResponse = (data) => {
  if (typeof data === 'string') {
    const jsonStart = data.indexOf('{');
    return jsonStart !== -1 ? JSON.parse(data.substring(jsonStart)) : null;
  }
  return data;
};

export const useJudgePortalData = () => {
  const [data, setData] = useState({
    judges: [],
    participants: [],
    recentScores: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const [judgesRes, participantsRes, scoresRes, categoriesRes] = await Promise.all([
       api.get('/api/get_judges.php'),
       api.get('/api/get_participants.php'),
       api.get('/api/get_recent_scores.php'),
       api.get('/api/get_categories.php'),
      ]);

      const cleanData = {
        judges: processResponse(judgesRes.data)?.judges || [],
        participants: processResponse(participantsRes.data)?.participants || [],
        recentScores: processResponse(scoresRes.data)?.scores || [],
        categories: processResponse(categoriesRes.data)?.categories || [],
      };

      setData(cleanData);
      setMessage({ type: '', text: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Failed to load data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, message, fetch };
};

