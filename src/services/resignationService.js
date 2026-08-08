import api from './axios';

export const resignationService = {
  submitResignation: async (data) => {
    const response = await api.post("/api/resignations", data);
    return response.data;
  },

  getMyResignation: async () => {
    const response = await api.get("/api/resignations/my-resignation");
    return response.data;
  },

  getAllResignations: async () => {
    const response = await api.get("/api/resignations");
    return response.data;
  },

  updateResignationStatus: async (id, data) => {
    const response = await api.patch(`/api/resignations/${id}/status`, data);
    return response.data;
  },

  processClearance: async (id) => {
    const response = await api.patch(`/api/resignations/${id}/clearance`);
    return response.data;
  }
};
