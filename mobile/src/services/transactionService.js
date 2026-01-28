import api from "../api/axios";

const TransactionService = {
  getAll: async (page = 1) => {
    const response = await api.get(`/api/transactions?page=${page}`);
    return response.data;
  },
};

export default TransactionService;
