const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);

  // Expired/invalid session on a protected call: clear it and go to login.
  // Login/register themselves return 401 for bad credentials, so skip those.
  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json().catch(() => null);
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
};

export const tripApi = {
  getAll: () => api.get('/api/trips'),
  getById: (id) => api.get(`/api/trips/${id}`),
  create: (data) => api.post('/api/trips', data),
  update: (id, data) => api.put(`/api/trips/${id}`, data),
  delete: (id) => api.delete(`/api/trips/${id}`),
};

export const itemApi = {
  getAll: (tripId) => api.get(`/api/trips/${tripId}/items`),
  create: (tripId, data) => api.post(`/api/trips/${tripId}/items`, data),
  update: (tripId, itemId, data) => api.put(`/api/trips/${tripId}/items/${itemId}`, data),
  delete: (tripId, itemId) => api.delete(`/api/trips/${tripId}/items/${itemId}`),
};

export const dashboardApi = {
  overall: () => api.get('/api/dashboard'),
  forTrip: (tripId) => api.get(`/api/trips/${tripId}/dashboard`),
};
