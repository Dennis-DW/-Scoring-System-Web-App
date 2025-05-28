// hooks/useScoreSubmission.js
import { useState } from 'react';
import axios from 'axios';

const processResponse = (data) => {
  if (typeof data === 'string') {
    const jsonStart = data.indexOf('{');
    return jsonStart !== -1 ? JSON.parse(data.substring(jsonStart)) : null;
  }
  return data;
};

const handleError = (err, setMessage) => {
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
};

export const useScoreSubmission = (onSuccess) => {
  const [form, setForm] = useState({
    judgeId: '',
    participantId: '',
    categoryId: '',
    points: '',
    comments: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.judgeId || !form.participantId || !form.categoryId || !form.points) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return false;
    }

    const points = parseInt(form.points);
    if (isNaN(points) || points < 1 || points > 100) {
      setMessage({ type: 'error', text: 'Score must be between 1 and 100' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/submit_score.php`, {
        judge_id: form.judgeId,
        participant_id: form.participantId,
        category_id: form.categoryId,
        points: parseInt(form.points),
        comments: form.comments?.trim() || '',
      });

      const responseData = processResponse(response.data);

      if (responseData.success) {
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

        onSuccess?.();
      } else {
        throw new Error(responseData.error || 'Failed to submit score');
      }
    } catch (err) {
      handleError(err, setMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    message,
    handleInputChange,
    handleSubmit,
  };
};