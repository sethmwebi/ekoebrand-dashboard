import axios from "axios";
import { useAuthStore } from "~/store/auth";

export const fetcher = async (url: string, options: any = {}) => {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    const response = await axios({
      url: `http://localhost:8000/v1/api${url}`,
      ...options,
      headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        // Attempt to refresh the access token
        const refreshResponse = await axios.get(
          "http://localhost:8000/auth/refresh",
          {
            withCredentials: true,
          }
        );

        const { accessToken: newAccessToken, user } = refreshResponse.data;

        // Update the auth store with the new access token and user
        useAuthStore.getState().setAuth(user, newAccessToken);

        // Retry the original request with the new access token
        const retryResponse = await axios({
          url: `http://localhost:8000/v1/api${url}`,
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
          withCredentials: true,
        });

        return retryResponse.data;
      } catch (refreshError) {
        // Clear auth state on refresh failure
        useAuthStore.getState().clearAuth();
        throw new Error("Session expired. Please login again.");
      }
    }

    // Handle other errors
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data || {};
      throw new Error(errorData.message || "Request failed");
    }

    throw new Error("An unexpected error occurred");
  }
};
