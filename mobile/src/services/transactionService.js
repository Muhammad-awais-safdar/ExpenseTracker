import api from "../api/axios";

const TransactionService = {
  getAll: async (params = {}) => {
    // Maintain backward compatibility if a raw page number is passed
    const queryParams = typeof params === "number" ? { page: params } : params;
    const response = await api.get("/api/transactions", {
      params: queryParams,
    });
    return response.data;
  },
};

export default TransactionService;
