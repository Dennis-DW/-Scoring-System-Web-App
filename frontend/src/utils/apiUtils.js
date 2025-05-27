// utils/apiUtils.js
export const processResponse = (data) => {
    if (typeof data === 'string') {
      const jsonStart = data.indexOf('{');
      return jsonStart !== -1 ? JSON.parse(data.substring(jsonStart)) : null;
    }
    return data;
  };
  
  export const handleError = (err, setMessage) => {
    let errorMessage = 'Operation failed';
    if (err.response?.data) {
      try {
        const cleanData = processResponse(err.response.data);
        errorMessage = cleanData.error || cleanData.message || errorMessage;
      } catch (e) {
        errorMessage = err.response.data;
      }
    }
    setMessage({ type: 'error', text: errorMessage });
  };