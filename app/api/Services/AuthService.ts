// api/services/authService.ts
import Axios from '../Axios';

export const register = async (userData: any) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await Axios.post('/api/service-centers/register/', userData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Registration failed" };
  }
};

export const Dologin = async (credentials: any) => {
  try {
    console.log('Logging in with credentials:', credentials);
    const response = await Axios.post('/api/auth/login/', credentials);
    console.log('login response:-----------', response);
    return response;
  } catch (error: any) {
    throw error?.response?.data || { message: "Login failed" };
  }
};
export const getProfile = async (id: string) => {
  try {
    console.log('Fetching user profile with id:', id);
    const response = await Axios.get(`/api/service-centers/${id}/`)
    console.log(response)
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch user profile" };
  }
}
