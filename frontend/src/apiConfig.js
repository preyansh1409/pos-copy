const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:5002/api';

export default API_BASE_URL;
