import { request } from './client';

export const login = async (username, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false
  });
};

export const getMe = async () => {
  return request('/auth/me', {
    method: 'GET',
    auth: true
  });
};

export const logout = async () => {
  return request('/auth/logout', {
    method: 'POST',
    auth: true
  });
};
