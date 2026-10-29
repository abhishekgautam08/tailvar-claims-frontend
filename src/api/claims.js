import { request } from './client';

export const listClaims = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.policyId) query.append('policyId', filters.policyId);

  const queryString = query.toString();
  const path = queryString ? `/claims?${queryString}` : '/claims';

  return request(path, {
    method: 'GET',
    auth: true
  });
};

export const getClaimById = async (id) => {
  return request(`/claims/${id}`, {
    method: 'GET',
    auth: true
  });
};

export const submitClaim = async ({ policyId, incidentDate, amount }) => {
  return request('/claims', {
    method: 'POST',
    body: { policyId, incidentDate, amount },
    auth: true
  });
};

export const decideClaim = async (id, decision) => {
  return request(`/claims/${id}/decision`, {
    method: 'PATCH',
    body: { decision },
    auth: true
  });
};
