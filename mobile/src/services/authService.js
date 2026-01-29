import api from "../api/axios";

const AuthService = {
  login: async (email, password) => {
    const response = await api.post(
      "/api/mobile/login",
      {
        email: email.trim(),
        password: password,
        device_name: "mobile",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    return response.data; // { user, token }
  },
  register: async (name, email, password, password_confirmation) => {
    const response = await api.post("/api/mobile/register", {
      name,
      email,
      password,
      password_confirmation,
      device_name: "mobile",
    });
    return response.data; // { user, token }
  },
  logout: async () => {
    return await api.post("/api/mobile/logout");
  },
  getUser: async () => {
    return await api.get("/api/user");
  },
  updateProfile: async (data) => {
    const response = await api.put("/api/profile", data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.put("/api/profile/password", data);
    return response.data;
  },
};

export default AuthService;
