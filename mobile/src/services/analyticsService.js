import api from "../api/axios";

const AnalyticsService = {
  /**
   * Fetch analytics data
   * @param {string} period 'day', 'week', 'month', 'year', 'custom'
   * @param {Date} startDate Optional, for custom range
   * @param {Date} endDate Optional, for custom range
   */
  getAnalytics: async (period = "month", startDate = null, endDate = null) => {
    try {
      const params = { period };
      if (startDate) params.start_date = startDate.toISOString().split("T")[0];
      if (endDate) params.end_date = endDate.toISOString().split("T")[0];

      const response = await api.get("/api/analytics", { params });
      return response.data;
    } catch (error) {
      console.error("AnalyticsService Error:", error);
      throw error;
    }
  },
};

export default AnalyticsService;
