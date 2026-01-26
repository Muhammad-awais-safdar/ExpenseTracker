import api from "../api/axios";

const LoanService = {
  getAll: async () => {
    const response = await api.get("/api/loans");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/loans", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/loans/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/loans/${id}`);
  },
};

export default LoanService;
