import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const analyzeCadFile = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/api/analyze', formData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.errors?.join(', ') || 'Failed to analyze CAD file.');
    }
    throw new Error('Network error or server is unavailable.');
  }
};
