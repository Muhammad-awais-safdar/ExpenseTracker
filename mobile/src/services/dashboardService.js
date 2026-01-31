import api from "../api/axios";

const DashboardService = {
  getSummary: async () => {
    const response = await api.get("/api/dashboard");
    return response.data;
  },
  getDashboardData: async () => {
    const response = await api.get("/api/dashboard");
    return response.data;
  },
};

export default DashboardService;
