import api from "../api/axios";

const DashboardService = {
  getSummary: async (month, year) => {
    let url = "/api/dashboard";
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  getDashboardData: async (month, year) => {
    return DashboardService.getSummary(month, year);
  },
};

export default DashboardService;
