// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie"; // Make sure to install: npm install js-cookie @types/js-cookie

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
    address: string;
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
  // ... existing properties
  verifyOtp: (data: { email: string; otp: string }) => Promise<string>;
  getUserInfo: () => Promise<User>; // Add this line
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
  token: null,
  tickets: [],
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  resetPassword: async () => {},
  verifyOtp: async () => "",
  resetPasswordWithToken: async () => {},
  submitTicket: async () => {},
  updateTicketStatus: async () => {},
  getUserInfo: async () => ({} as User), // Add this line
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
  clearError: () => {},
});

// Create an axios instance for API calls
const api = axios.create({
  //baseURL: 'http://localhost:5151',
  baseURL: "https://api.hmes.buubuu.id.vn/api",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "multipart/form-data",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("authToken");

    // Add authorization header
    if (authToken && config.headers) {
      try {
        config.headers.set("Authorization", `Bearer ${authToken}`);
      } catch (e) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }
    }

    // Only set Content-Type and Accept headers if the data is not FormData
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket>();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  // Clear any error messages
  const clearError = () => setError(null);

  // Thiết lập các tùy chọn cho cookie
  // const saveAuthToCookies = (authData: AuthData) => {
  //   const isLocalhost = window.location.hostname === 'localhost';

  //   const cookieOptions = {
  //     expires: 7,
  //     path: '/',
  //     ...(isLocalhost ? {} : { domain: 'hmes.buubuu.id.vn' }), // Đảm bảo domain phù hợp
  //     secure: window.location.protocol === 'https:',
  //     sameSite: (isLocalhost ? 'lax' : 'strict') as 'lax' | 'strict', // Ép kiểu trực tiếp
  //   };

  //   Cookies.remove('DeviceId', { path: '/' });
  //   Cookies.remove('RefreshToken', { path: '/' });

  //   Cookies.set('DeviceId', authData.deviceId, cookieOptions);
  //   Cookies.set('RefreshToken', authData.refeshToken, cookieOptions);

  //   localStorage.setItem('DeviceId', authData.deviceId);
  //   localStorage.setItem('RefreshToken', authData.refeshToken);
  //   localStorage.setItem('authToken', authData.token);
  // };

  // Helper function to clear auth cookies
  const clearAuthCookies = () => {
    Cookies.remove("DeviceId", { path: "/" });
    Cookies.remove("RefreshToken", { path: "/" });
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", data);
      console.log("Login response:", response.data);

      // Check for direct user data structure first
      const userData = response.data;

      // Validate the response has the expected structure
      if (userData && userData.id && userData.email) {
        // This is the direct user data structure
        setUser(userData);

        if (userData.auth && userData.auth.token) {
          setToken(userData.auth.token);
          localStorage.setItem("authToken", userData.auth.token);

          // Set cookies for auth data
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          document.cookie = `DeviceId=${
            userData.auth.deviceId || ""
          }; path=/; expires=${expires.toUTCString()}`;
          document.cookie = `RefreshToken=${
            userData.auth.refeshToken || ""
          }; path=/; expires=${expires.toUTCString()}`;

          // Log the cookies
          setTimeout(() => {
            console.log("Cookies after login:", {
              DeviceId: Cookies.get("DeviceId") || "missing",
              RefreshToken: Cookies.get("RefreshToken") || "missing",
              AllCookies: document.cookie,
            });
          }, 100);

          return;
        } else {
          throw new Error("Authentication token missing from response");
        }
      }
      // Fall back to checking nested data structures
      else if (response.data?.data || response.data?.response?.data) {
        const nestedUserData =
          response.data?.data || response.data?.response?.data;

        if (nestedUserData) {
          setUser(nestedUserData);

          if (nestedUserData.auth) {
            setToken(nestedUserData.auth.token);
            localStorage.setItem("authToken", nestedUserData.auth.token);

            // Set cookies for auth data
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `DeviceId=${
              nestedUserData.auth.deviceId || ""
            }; path=/; expires=${expires.toUTCString()}`;
            document.cookie = `RefreshToken=${
              nestedUserData.auth.refeshToken || ""
            }; path=/; expires=${expires.toUTCString()}`;

            setTimeout(() => {
              console.log("Cookies after login:", {
                DeviceId: Cookies.get("DeviceId") || "missing",
                RefreshToken: Cookies.get("RefreshToken") || "missing",
                AllCookies: document.cookie,
              });
            }, 100);

            return;
          }
        }
      }

      // If we get here, the response didn't match any expected format
      console.error(
        "Login response structure unexpected:",
        JSON.stringify(response.data, null, 2)
      );
      throw new Error("Invalid response format from server");
    } catch (err) {
      // Rest of your error handling remains the same
      // ...
    } finally {
      setLoading(false);
    }
  };

  // Add this function after the login function
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Send registration request
      const response = await api.post("/auth/register", data);
      console.log("Register response:", response.data);

      // Check if registration was successful
      if (
        response.data?.statusCodes === 200 ||
        response.data?.response?.message
      ) {
        // Registration successful - now log in with the same credentials
        console.log("Registration successful, attempting login...");

        // Automatically log in the user after successful registration
        try {
          await login({
            email: data.email,
            password: data.password,
          });

          // If login succeeds, function will return naturally
          return;
        } catch (loginErr) {
          // If auto-login fails, throw a more specific error
          console.error("Auto-login after registration failed:", loginErr);
          throw new Error(
            "Registration successful, but automatic login failed. Please try logging in manually."
          );
        }
      } else if (response.data?.error || response.data?.response?.error) {
        // API returned an error message
        const errorMessage =
          response.data?.error ||
          response.data?.response?.error ||
          "Registration failed";
        throw new Error(errorMessage);
      } else {
        // Unexpected response format
        console.error(
          "Register response structure:",
          JSON.stringify(response.data, null, 2)
        );
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle API errors
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.response?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        console.error("Register error:", errorMessage);

        // For CORS or network errors, provide more specific messages
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
        // Handle custom errors
        setError(err.message);
        console.error("Register error:", err.message);
      } else {
        // Handle unexpected errors
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
      // Lấy authToken từ localStorage
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("Missing authentication token");
        throw new Error("Authentication required. Please log in again.");
      }

      // Tạo headers cho request
      console.log("Making request to /api/user/me with cookies included");

      // Gửi request với Axios
      const deviceId = Cookies.get("DeviceId");
      const refreshToken = Cookies.get("RefreshToken");

      console.log("DeviceId", deviceId);
      console.log("RefreshToken", refreshToken);

      // const response = await axios({
      //   method: 'GET',
      //   url: 'https://api.hmes.buubuu.id.vn/api/user/me',
      //   headers: {
      //     'Authorization': `Bearer ${authToken}`,
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json',
      //     'Cookie': document.cookie,
      //   },
      //   withCredentials: true,
      // });
      const response = await api.get("user/me");

      console.log("User info response:", response.data);

      if (response.data?.statusCodes === 200 || response.data?.data) {
        const userData = response.data?.data || response.data?.response?.data;

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
      // Explicitly type the error as unknown
      console.error("Error fetching user info:", err);

      // Type guard to handle the error properly
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching user information.");
      }

      // Ensure we return a rejected promise
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

      // Validate that new password and confirm password match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      // Validate we have a logged-in user
      if (!user || !user.id) {
        throw new Error("You must be logged in to change your password");
      }

      // Get authentication tokens
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

      // Prepare request data
      const requestData = {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      // Make API request
      const response = await api.post(
        "/api/auth/me/change-password",
        requestData
      );

      console.log("Change password response:", response.data);

      // Check for successful response
      if (
        response.data?.statusCode === 200 ||
        response.data?.statusCodes === 200 ||
        response.data?.message?.includes("success") ||
        response.data?.message?.includes("changed") ||
        response.status === 200
      ) {
        // Password changed successfully - don't return a value (void)
        return;
      }

      // If we reach here without returning or throwing, something went wrong
      console.error("Unexpected response format:", response.data);
      throw new Error(
        "Server returned an unexpected response. Please try again."
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle API errors
        let errorMessage = "Failed to change password. Please try again.";

        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "Current password is incorrect.";
          } else if (err.response.status === 400) {
            // Extract specific error message from API if available
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
            // Use any error message provided by the API
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

      // Rethrow the error with a clearer message for the component to handle
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password - request OTP to be sent via email
  // Reset password - request OTP to be sent via email
  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Requesting OTP for password reset for email:", email);

      // The API expects a raw string for email, not an object
      const response = await api.post(
        "/api/otp/send",
        JSON.stringify(email), // Important: Send as a JSON-encoded string
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

  // New function to verify OTP and get reset token (separate from password reset)
  // New function to verify OTP and get reset token (separate from password reset)
  const verifyOtp = async (data: {
    email: string;
    otp: string;
  }): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      console.log("Verifying OTP to get reset token");

      // Verify OTP and get temporary token
      const verifyResponse = await api.post("/api/otp/verify", {
        email: data.email,
        otpCode: data.otp,
      });

      console.log("OTP verification response:", verifyResponse.data);

      // Check if OTP verification was successful
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

      // Extract the reset token from the response - handle the nested structure
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

      // Save the reset token to localStorage
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

  // Updated function to reset password using token
  const resetPasswordWithToken = async (data: {
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New password and confirmation do not match");
      }

      // Get the reset token from localStorage
      const resetToken = localStorage.getItem("passwordResetToken");

      if (!resetToken) {
        throw new Error("Reset token not found. Please verify your OTP again.");
      }

      console.log("Resetting password with token");

      // Call the API to reset password with the token in both the request body and header
      const resetResponse = await api.post(
        "/api/auth/me/reset-password",
        {
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`, // Set the token in the Authorization header
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
        // Password reset was successful
        // Remove the reset token from localStorage
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

        // Handle token expiration
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

    // Clear user data from state first for immediate UI feedback
    setUser(null);
    setToken(null);

    // Clear cookies
    clearAuthCookies();

    // Clear local storage items
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); // Also clear cart if you have one

    // Send logout request to the API (don't await it)
    if (user?.email) {
      api
        .post("/api/auth/logout", {
          email: user.email,
          password: "", // Required by API
        })
        .catch((err) => {
          console.error("Logout error:", err);
          // We don't need to handle this error in the UI since user is already logged out locally
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  // Submit a support ticket
  const submitTicket = async (
    ticketData: Omit<Ticket, "id" | "status" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    setError(null);

    try {
      // If API is available, use it
      const response = await api.post("/api/tickets", ticketData);

      if (response.data && response.data.data) {
        const newTicket = response.data.data;
        setTickets((prev) => [...prev, newTicket]);
        return;
      }

      // Fallback to local storage if API fails or doesn't exist
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

  // Update ticket status
  const updateTicketStatus = async (
    ticketId: string,
    status: Ticket["status"]
  ) => {
    setLoading(true);
    setError(null);

    try {
      // If API is available, use it
      const response = await api.patch(`/api/tickets/${ticketId}`, { status });

      if (response.data && response.data.success) {
        // Update local tickets state with the updated ticket
        const updatedTickets = tickets.map((ticket) => {
          if (ticket.id === ticketId) {
            return { ...ticket, status, updatedAt: new Date() };
          }
          return ticket;
        });

        setTickets(updatedTickets);
        return;
      }

      // Fallback to local storage if API fails
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

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Updating profile with data:", data);

      // Get authentication token
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Use PUT method to update user information at api/user/me
      const response = await api.put("/api/user/me", {
        name: data.name,
        phone: data.phone,
      });

      console.log("Profile update response:", response.data);

      // Check if update was successful
      if (response.data) {
        // Get the updated user data - either from the response or the original data
        const updatedUserData = response.data.data || response.data;

        // Update user state with the new data
        setUser((prevUser) => ({
          ...prevUser,
          ...(updatedUserData || {}),
          // If the response doesn't include updated fields, use our input data
          name: updatedUserData?.name || data.name || prevUser?.name,
          phone: updatedUserData?.phone || data.phone || prevUser?.phone,
        }));

        // Try to refresh the complete user info
        try {
          await getUserInfo();
        } catch (refreshErr) {
          console.warn(
            "Could not refresh user data after profile update:",
            refreshErr
          );
          // Continue since the update was still successful
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

        // Handle specific status codes
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

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have auth cookies
      const savedToken = Cookies.get("token");
      const savedDeviceId = Cookies.get("DeviceId");

      if (savedToken && savedDeviceId) {
        setLoading(true);

        try {
          // Get user info using the saved token
          const response = await api.get("/api/auth/me");

          if (response.data && response.data.data) {
            setUser(response.data.data);
            setToken(savedToken);
          }
        } catch (err) {
          console.error("Failed to restore session:", err);
          // If token is invalid or expired, clear everything
          //clearAuthCookies();
          setToken(null);
        } finally {
          setLoading(false);
        }
      }

      // Load tickets from localStorage for fallback
      const storedTickets = localStorage.getItem("tickets");
      if (storedTickets) {
        setTickets(JSON.parse(storedTickets));
      }
    };

    checkAuth();

    // Optional: Setup WebSocket connection for real-time updates
    // socket.current = io('wss://api.hmes.buubuu.id.vn');
    // socket.current.on('connect', () => {
    //   console.log('Connected to WebSocket');
    // });

    // return () => {
    //   socket.current?.disconnect();
    // };
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

export default api; // Export the API instance for direct use
