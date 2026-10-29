import { request } from './client';

export const listCustomers = async () => {
  return request('/customers', {
    method: 'GET',
    auth: true
  });
};
