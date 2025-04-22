import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";

interface Ticket {
  id: string;
  userId: number;
  userName: string;
  email: string;
  issueType: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

interface AuthData {
  deviceId: string;
  token: string;
  refeshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  attachment?: string | null;
  auth?: AuthData;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tickets: Ticket[];
  submitTicket: (
    ticketData: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTicketStatus: (
    ticketId: string,
    status: Ticket["status"]
  ) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  logout: () => void;
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; message: string } | void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordWithToken: (data: {
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  verifyOtp: (data: { email: string; otp: string }) => Promise<string>;
  getUserInfo: () => Promise<User>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface StoredUser extends Omit<User, "auth"> {
  password: string;
}

// Create a default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: localStorage.getItem("authToken") ?? null,
  tickets: [],
  login: async () => { },
  register: async () => { },
  logout: () => { },
  updateProfile: async () => { },
  changePassword: async () => { },
  resetPassword: async () => { },
  verifyOtp: async () => "",
  resetPasswordWithToken: async () => { },
  submitTicket: async () => { },
  updateTicketStatus: async () => { },
  getUserInfo: async () => ({} as User),
  isAuthenticated: localStorage.getItem("authToken") != null ? true : false,
  isAdmin: false,
  loading: false,
  error: null,
  clearError: () => { },
});

const api = axios.create({
  baseURL: "https://api.hmes.site/api",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "multipart/form-data",
  },
  withCredentials: true,
});

let authRefreshFunction: () => Promise<string>;
let authLogoutFunction: () => void;

api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("authToken");

    if (authToken && config.headers) {
      try {
        config.headers.set("Authorization", `Bearer ${authToken}`);
      } catch (e) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }
    }

    if (!(config.data instanceof FormData) && config.headers) {
      try {
        config.headers.set("Content-Type", "application/json");
        config.headers.set("Accept", "application/json");
      } catch (e) {
        config.headers["Content-Type"] = "application/json";
        config.headers["Accept"] = "application/json";
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!authRefreshFunction) {
          throw new Error("Authentication refresh function not initialized");
        }

        const newToken = await authRefreshFunction();

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to retry request after refreshing token:", refreshError);

        if (authLogoutFunction) {
          authLogoutFunction();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket>();

  const isAuthenticated = !!user || localStorage.getItem("authToken") != null;
  const isAdmin = user?.role === "admin";

  const clearError = () => setError(null);

  const clearAuthCookies = () => {
    Cookies.remove("DeviceId", { path: "/" });
    Cookies.remove("RefreshToken", { path: "/" });
  };

  // Update the refreshAuthToken function
  const refreshAuthToken = async () => {
    try {
      console.log("Attempting to refresh auth token");

      // Get the refresh token from cookies
      const refreshToken = Cookies.get("RefreshToken");
      const deviceId = Cookies.get("DeviceId");

      console.log("Refresh token available:", !!refreshToken);
      console.log("Device ID available:", !!deviceId);

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // No need to send the refresh token in the body since it's in cookies
      const response = await api.post("/auth/refresh-token", {}, {
        withCredentials: true // Ensure cookies are sent with the request
      });

      console.log("Refresh token response:", response.data);

      if (response.data?.statusCodes === 200 && response.data?.response?.data?.auth?.token) {
        // Extract the new token from the response
        const newToken = response.data.response.data.auth.token;
        console.log("New token received:", !!newToken);

        // Update token in state and localStorage
        setToken(newToken);
        localStorage.setItem("authToken", newToken);

        return newToken;
      } else if (response.data?.token) {
        // Alternative response format
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem("authToken", newToken);
        return newToken;
      }

      throw new Error("Failed to refresh token");
    } catch (error) {
      console.error("Refresh token failed:", error);
      logout();
      throw error;
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", data);
      console.log("Login response:", response.data);

      // Xử lý định dạng response mới
      if (
        response.data?.statusCodes === 200 &&
        response.data?.response?.data
      ) {
        const userData = response.data.response.data;

        if (userData && userData.id && userData.email) {
          setUser(userData);

          if (userData.auth && userData.auth.token) {
            const { token } = userData.auth;

            // Lưu access token vào localStorage
            setToken(token);
            localStorage.setItem("authToken", token);

            // Lưu refresh token và deviceId vào cookies từ response headers
            // Lưu ý: refresh token và deviceId thường được trả về trong cookies của response
            const cookies = document.cookie.split(';');
            console.log("Cookies received:", cookies);

            // Bước này không cần thiết nếu server đã tự động thiết lập cookies
            // Nhưng để an toàn, chúng ta vẫn kiểm tra và lưu lại
            const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('RefreshToken='));
            const deviceIdCookie = cookies.find(cookie => cookie.trim().startsWith('DeviceId='));

            if (refreshTokenCookie && deviceIdCookie) {
              console.log("Found refresh token and device ID in cookies");
            } else {
              console.log("No refresh token or device ID found in cookies, server might have set them automatically");
            }

            return;
          } else {
            throw new Error("Authentication token missing from response");
          }
        }

        console.error("Unexpected login response structure:", response.data);
        throw new Error("Invalid response format from server");
      } else if (response.data?.statusCodes !== 200) {
        let errorMessage =
          response.data?.response?.message ||
          response.data?.message ||
          "Login failed. Please check your credentials.";
        throw new Error(errorMessage);
      } else {
        console.error("Unexpected login response structure:", response.data);
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      if (axios.isAxiosError(err)) {
        let errorMessage =
          err.response?.data?.response?.message ||
          err.response?.data?.message ||
          "Failed to login. Please try again.";

        if (err.response?.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else if (err.response?.status === 403) {
          setError("Your account is locked. Please contact support.");
        } else if (err.response?.status === 404) {
          setError("Account not found. Please check your email or register.");
        }

        switch (errorMessage) {
          case "User not found": {
            errorMessage = "Tài khoản không tồn tại. Vui lòng kiểm tra địa chỉ email hoặc đăng ký.";
            break;
          }
          case "Password is incorrect": {
            errorMessage = "Mật khẩu không hợp lệ. Vui lòng thử lại.";
            break;
          }
        }

        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during login");
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/register", data);
      console.log("Register response:", response.data);

      if (
        response.data?.statusCodes === 200 ||
        response.data?.response?.message
      ) {
        console.log("Registration successful, attempting login...");
        try {
          await login({
            email: data.email,
            password: data.password,
          });
          return;
        } catch (loginErr) {
          console.error("Auto-login after registration failed:", loginErr);
          throw new Error(
            "Registration successful, but automatic login failed. Please try logging in manually."
          );
        }
      } else if (response.data?.error || response.data?.response?.error) {
        const errorMessage =
          response.data?.error ||
          response.data?.response?.error ||
          "Registration failed";
        throw new Error(errorMessage);
      } else {
        console.error(
          "Register response structure:",
          JSON.stringify(response.data, null, 2)
        );
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.response?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        console.error("Register error:", errorMessage);

        if (err.code === "ERR_NETWORK") {
          setError(
            "Network error: Unable to connect to the server. Please try again later."
          );
        } else if (err.response?.status === 409) {
          setError(
            "Email already in use. Please use a different email address."
          );
        } else if (err.response?.status === 400) {
          setError("Invalid information provided. Please check your details.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("Register error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected register error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("Missing authentication token");
        throw new Error("Authentication required. Please log in again.");
      }

      console.log("Making request to /api/user/me with cookies included");

      const deviceId = Cookies.get("DeviceId");
      const refreshToken = Cookies.get("RefreshToken");

      console.log("DeviceId", deviceId);
      console.log("RefreshToken", refreshToken);

      const response = await api.get("user/me");

      console.log("User info response:", response.data);

      if (response.data?.statusCodes === 200 || response.data?.data) {
        const userData = response.data?.data || response.data?.response?.data;
        var newToken = response.headers["new-access-token"];
        if (newToken != null) {
          const newToken = response.headers["new-access-token"];
          setToken(newToken);
          localStorage.setItem("authToken", newToken);
        }
        if (userData) {
          setUser((prevUser) => ({
            ...prevUser,
            ...userData,
          }));
          return userData;
        }
      }

      throw new Error("Failed to fetch user information");
    } catch (err: unknown) {
      console.error("Error fetching user info:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching user information.");
      }

      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting to change password");

      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      if (!user || !user.id) {
        throw new Error("You must be logged in to change your password");
      }

      const authToken = localStorage.getItem("authToken");
      const deviceId = Cookies.get("DeviceId");
      const refreshToken = Cookies.get("RefreshToken");

      console.log("Authentication tokens available:", {
        authToken: authToken ? "exists" : "missing",
        deviceId: deviceId ? "exists" : "missing",
        refreshToken: refreshToken ? "exists" : "missing",
      });

      if (!authToken) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const requestData = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await api.post(
        "/auth/me/change-password",
        requestData
      );

      console.log("Change password response:", response.data);

      if (
        response.data?.statusCode === 200 ||
        response.data?.statusCodes === 200 ||
        response.data?.message?.includes("success") ||
        response.data?.message?.includes("changed") ||
        response.status === 200
      ) {
        return;
      }

      console.error("Unexpected response format:", response.data);
      throw new Error(
        "Server returned an unexpected response. Please try again."
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        let errorMessage = "Failed to change password. Please try again.";

        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "Current password is incorrect.";
          } else if (err.response.status === 400) {
            errorMessage =
              err.response?.data?.message ||
              err.response?.data?.error ||
              "Invalid request. Please check your password requirements.";
          } else if (err.response.status === 403) {
            errorMessage = "You are not authorized to change this password.";
          } else if (err.response.status === 422) {
            errorMessage =
              "Password validation failed. New password may not meet requirements.";
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Network error: Unable to connect to the server. Please try again later.";
        }

        setError(errorMessage);
        console.error("Change password error:", errorMessage);
        console.error("Error details:", err.response?.data);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("Change password error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected change password error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Requesting OTP for password reset for email:", email);

      const response = await api.post(
        "/otp/send",
        JSON.stringify(email),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Send OTP response:", response.data);

      if (
        response.data?.statusCode === 200 ||
        response.data?.statusCodes === 200 ||
        response.status === 200 ||
        response.data?.message?.includes("success") ||
        response.data?.message?.includes("sent")
      ) {
        return;
      }

      throw new Error(
        response.data?.message || "Failed to send OTP. Please try again."
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to request OTP.";

        if (err.response?.status === 400 && err.response?.data?.errors) {
          console.error(
            "API validation error details:",
            JSON.stringify(err.response.data)
          );
          const validationErrors = err.response.data.errors;
          if (validationErrors.Email && validationErrors.Email.length > 0) {
            setError(validationErrors.Email[0]);
            console.error("Email validation error:", validationErrors.Email[0]);
          } else if (validationErrors.$ && validationErrors.$.length > 0) {
            setError(
              "Invalid email format. Please provide a valid email address."
            );
            console.error("Format error:", validationErrors.$[0]);
          } else {
            setError("Invalid request format. Please try again.");
            console.error("Validation errors:", validationErrors);
          }
        } else {
          setError(errorMessage);
          console.error("Send OTP error:", errorMessage);
        }

        if (err.response?.status === 404) {
          throw new Error("Email not found. Please check your email address.");
        } else if (err.response?.status === 429) {
          throw new Error(
            "Too many attempts. Please wait before trying again."
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("Send OTP error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected OTP request error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data: {
    email: string;
    otp: string;
  }): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Verifying OTP to get reset token");

      const verifyResponse = await api.post("/api/otp/verify", {
        email: data.email,
        otpCode: data.otp,
      });

      console.log("OTP verification response:", verifyResponse.data);

      if (
        !(
          verifyResponse.data?.statusCode === 200 ||
          verifyResponse.data?.statusCodes === 200 ||
          verifyResponse.status === 200 ||
          verifyResponse.data?.message?.includes("success") ||
          verifyResponse.data?.message?.includes("valid")
        )
      ) {
        throw new Error("Invalid or expired OTP. Please try again.");
      }

      const tempToken =
        verifyResponse.data?.response?.data?.tempToken ||
        verifyResponse.data?.data?.tempToken ||
        verifyResponse.data?.tempToken;

      if (!tempToken) {
        console.error("Token not found in response:", verifyResponse.data);
        throw new Error(
          "Server did not provide a reset token. Please try again."
        );
      }

      console.log("Successfully retrieved temporary token");

      localStorage.setItem("passwordResetToken", tempToken);

      return tempToken;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        let errorMessage = "Failed to verify OTP.";

        if (err.response?.status === 400) {
          errorMessage = err.response.data?.message || "Invalid OTP code.";
        } else if (err.response?.status === 401) {
          errorMessage = "Invalid or expired OTP.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
        console.error("OTP verification error:", errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("OTP verification error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected OTP verification error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordWithToken = async (data: {
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New password and confirmation do not match");
      }

      const resetToken = localStorage.getItem("passwordResetToken");

      if (!resetToken) {
        throw new Error("Reset token not found. Please verify your OTP again.");
      }

      console.log("Resetting password with token");

      const resetResponse = await api.post(
        "/api/auth/me/reset-password",
        {
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      );

      console.log("Password reset response:", resetResponse.data);

      if (
        resetResponse.data?.statusCode === 200 ||
        resetResponse.data?.statusCodes === 200 ||
        resetResponse.status === 200 ||
        resetResponse.data?.message?.includes("success") ||
        resetResponse.data?.message?.includes("reset")
      ) {
        localStorage.removeItem("passwordResetToken");
        return;
      }

      throw new Error(
        resetResponse.data?.message ||
        "Failed to reset password. Please try again."
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        let errorMessage = "Failed to reset password.";

        if (err.response?.status === 401) {
          errorMessage = "Reset token has expired. Please request a new OTP.";
          localStorage.removeItem("passwordResetToken");
        } else if (err.response?.status === 400) {
          errorMessage = err.response.data?.message || "Invalid password.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
        console.error("Password reset error:", errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("Password reset error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected password reset error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    setError(null);

    setUser(null);
    setToken(null);
    setError(null);
    clearAuthCookies();

    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.clear();

    if (user?.email) {
      api
        .post("/auth/logout", {
          email: user.email,
          password: "",
        })
        .catch((err) => {
          console.error("Logout error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const submitTicket = async (
    ticketData: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/tickets", ticketData);

      if (response.data && response.data.data) {
        const newTicket = response.data.data;
        setTickets((prev) => [...prev, newTicket]);
        return;
      }

      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        userId: parseInt(user?.id || "0"),
        userName: user?.name || "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
      localStorage.setItem(
        "tickets",
        JSON.stringify([...storedTickets, newTicket])
      );

      socket.current?.emit("submitTicket", newTicket);
      setTickets((prev) => [...prev, newTicket]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to submit ticket.";
        setError(errorMessage);
        console.error("Ticket submission error:", errorMessage);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected ticket submission error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (
    ticketId: string,
    status: Ticket["status"]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/api/tickets/${ticketId}`, { status });

      if (response.data && response.data.success) {
        const updatedTickets = tickets.map((ticket) => {
          if (ticket.id === ticketId) {
            return { ...ticket, status, updatedAt: new Date() };
          }
          return ticket;
        });

        setTickets(updatedTickets);
        return;
      }

      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id === ticketId) {
          return { ...ticket, status, updatedAt: new Date() };
        }
        return ticket;
      });

      localStorage.setItem("tickets", JSON.stringify(updatedTickets));
      socket.current?.emit("updateTicket", { ticketId, status });
      setTickets(updatedTickets);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to update ticket.";
        setError(errorMessage);
        console.error("Ticket update error:", errorMessage);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected ticket update error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Updating profile with data:", data);

      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await api.put("/user/me", {
        name: data.name,
        phone: data.phone,
      });

      console.log("Profile update response:", response.data);

      if (response.data) {
        const updatedUserData = response.data.data || response.data;

        setUser((prevUser) => ({
          ...prevUser,
          ...(updatedUserData || {}),
          name: updatedUserData?.name || data.name || prevUser?.name,
          phone: updatedUserData?.phone || data.phone || prevUser?.phone,
        }));

        try {
          await getUserInfo();
        } catch (refreshErr) {
          console.warn(
            "Could not refresh user data after profile update:",
            refreshErr
          );
        }

        return;
      }

      throw new Error("Failed to update profile. Please try again.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to update profile.";
        setError(errorMessage);
        console.error("Profile update error:", errorMessage);
        console.error("Error status:", err.response?.status);
        console.error("Error details:", err.response?.data);

        if (err.response?.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        } else if (err.response?.status === 400) {
          throw new Error(
            err.response.data?.message || "Invalid information provided."
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
        console.error("Profile update error:", err.message);
      } else {
        setError("An unexpected error occurred");
        console.error("Unexpected profile update error:", err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect to handle initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log("Initializing authentication state");

        // Check for existing token in localStorage
        const authToken = localStorage.getItem("authToken");
        // Check for refresh token in cookies
        const refreshToken = Cookies.get("RefreshToken");
        const deviceId = Cookies.get("DeviceId");

        console.log("Auth state on init:", {
          authToken: authToken ? "exists" : "missing",
          refreshToken: refreshToken ? "exists" : "missing",
          deviceId: deviceId ? "exists" : "missing"
        });

        if (authToken) {
          try {
            // Try to get user info with the current token
            console.log("Getting user info with existing token");
            const userData = await getUserInfo();
            setUser(userData);
            setToken(authToken);
            console.log("Successfully authenticated with existing token");
          } catch (error) {
            console.error("Error using existing token:", error);

            // If the token is invalid but we have a refresh token, try to refresh
            if (refreshToken) {
              try {
                console.log("Trying to refresh token");
                const newToken = await refreshAuthToken();
                // After refresh, get user info
                const userData = await getUserInfo();
                setUser(userData);
                setToken(newToken);
                console.log("Successfully refreshed token and authenticated");
              } catch (refreshError) {
                console.error("Error refreshing token:", refreshError);
                // Clear everything if refresh fails
                logout();
              }
            } else {
              console.log("No refresh token available, logging out");
              logout();
            }
          }
        }
        // If no token but we have a refresh token, try to refresh
        else if (refreshToken) {
          try {
            console.log("No auth token but refresh token exists, attempting refresh");
            const newToken = await refreshAuthToken();
            const userData = await getUserInfo();
            setUser(userData);
            setToken(newToken);
            console.log("Successfully obtained new token via refresh");
          } catch (error) {
            console.error("Error refreshing token during init:", error);
            logout();
          }
        } else {
          console.log("No authentication tokens found, user is not logged in");
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    authRefreshFunction = refreshAuthToken;
    authLogoutFunction = logout;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tickets,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        submitTicket,
        updateTicketStatus,
        resetPassword,
        verifyOtp,
        resetPasswordWithToken,
        getUserInfo,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default api;

