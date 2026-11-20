 
import API from "./Axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  JWT_token: string;
}

export const AuthAPI = {
  login: async (email: string, password: string) => {
    const response = await API.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    const token = response.data.JWT_token;

    if (!token || typeof token !== "string") {
      throw new Error("JWT token missing");
    }

    localStorage.setItem("token", token);

    console.log(response.data)

    return response.data;
  },

  signup: async (
    name: string,
    email: string,
    password: string
  ) => {
    const response = await API.post("/auth/signup", {
      name,
      email,
      password,
    });

    return response.data;
  },
};
