const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/_/backend/api' 
  : 'http://localhost:5002/api';

export default API_BASE_URL;
