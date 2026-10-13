const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Helper to get the stored JWT token
 */
export function getStoredToken() {
  return localStorage.getItem('cacheflow_token');
}

/**
 * Generic fetch wrapper with Authorization header injection and error handling
 */
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('cacheflow_token');
    localStorage.removeItem('cacheflow_user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.message || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

// Auth API
export const apiLogin = async (username, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const apiRegister = async (username, email, password) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
};

export const apiGetCurrentUser = async () => {
  return request('/auth/me', {
    method: 'GET'
  });
};

// User / Salary API
export const apiGetSalary = async () => {
  return request('/user/salary', {
    method: 'GET'
  });
};

export const apiUpdateSalary = async (salary) => {
  return request('/user/salary', {
    method: 'PUT',
    body: JSON.stringify({ salary: parseFloat(salary) })
  });
};

export const apiResetAllData = async () => {
  return request('/user/reset', {
    method: 'POST'
  });
};

// Expenses API
export const apiGetExpenses = async () => {
  return request('/expenses', {
    method: 'GET'
  });
};

export const apiCreateExpense = async ({ name, amount, category, date }) => {
  return request('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      name,
      amount: parseFloat(amount),
      category,
      date: date || new Date().toISOString().split('T')[0]
    })
  });
};

export const apiDeleteExpense = async (id) => {
  return request(`/expenses/${id}`, {
    method: 'DELETE'
  });
};

export const apiDeleteAllExpenses = async () => {
  return request('/expenses', {
    method: 'DELETE'
  });
};
