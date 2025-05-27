// hooks/useJudgePortalData.js
import { useState, useCallback } from 'react';
import axios from 'axios';

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
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/backend/api/get_judges.php`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/backend/api/get_participants.php`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/backend/api/get_recent_scores.php`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/backened/api/get_categories.php`),
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

