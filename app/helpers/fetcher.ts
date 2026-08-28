import axios from "axios";

const AUTH_KEY = "auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
};

type AuthData = {
  user: AuthUser;
  accessToken: string;
};

export function saveAuth(user: AuthUser, accessToken: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, accessToken }));
}

export function getAuth(): AuthData | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthData;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export const fetcher = async (url: string, options: any = {}) => {
  const auth = getAuth();
  const accessToken = auth?.accessToken;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    const response = await axios({
      url: `${import.meta.env.VITE_BACKEND_URL}/v1/api${url}`,
      ...options,
      headers,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      try {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, user } = refreshResponse.data;

        saveAuth(user, newAccessToken);

        const retryResponse = await axios({
          url: `${import.meta.env.VITE_BACKEND_URL}/v1/api${url}`,
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
          withCredentials: true,
        });

        return retryResponse.data;
      } catch (refreshError) {
        clearAuth();
        throw new Error("Session expired. Please login again.");
      }
    }

    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data || {};
      throw new Error(errorData.message || errorData.error || "Request failed");
    }

    throw new Error("An unexpected error occurred");
  }
};
