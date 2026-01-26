import api from "../api/axios";

const AuthService = {
  login: async (email, password) => {
    const response = await api.post("/api/mobile/login", { email, password });
    return response.data; // { user, token }
  },
  register: async (name, email, password, password_confirmation) => {
    const response = await api.post("/api/mobile/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    return response.data; // { user, token }
  },
  logout: async () => {
    return await api.post("/api/mobile/logout");
  },
  getUser: async () => {
    return await api.get("/api/user");
  },
};

export default AuthService;
