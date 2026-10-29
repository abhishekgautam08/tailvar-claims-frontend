import { request } from './client';

export const listPolicies = async () => {
  return request('/policies', {
    method: 'GET',
    auth: true
  });
};

export const getPolicyById = async (id) => {
  return request(`/policies/${id}`, {
    method: 'GET',
    auth: true
  });
};

export const createPolicy = async ({ customerId, startDate, endDate, sumInsured }) => {
  return request('/policies', {
    method: 'POST',
    body: { customerId, startDate, endDate, sumInsured },
    auth: true
  });
};
