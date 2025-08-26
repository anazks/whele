import axios from '../Axios';

export const addStaff = async (Data: any) => {
  try {
    console.log("Data", Data);
    let response = await axios.post('/api/users/register/', Data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log("Backend Error:", error.response.data); // 👈 this shows real reason
      return error.response.data;
    } else {
      console.log("Error:", error.message);
      return { message: error.message };
    }
  }
};

export const addCustomer = async (Data: any) => {
  try {
    console.log("Data", Data);
    let response = await axios.post('/interaction/user/interactions/customers/', Data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log("Backend Error:", error.response.data); // 👈 this shows real reason
      return error.response.data;
    } else {
      console.log("Error:", error.message);
      return { message: error.message };
    }
  }
}

export const getCustomer = async () => {
  try {

    const response = await axios.get(`/interaction/user/interactions/customers/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch customer" };
  }
}

export const getBrand = async () => {
  try {
    const response = await axios.get(`/interaction/user/interactions/brands/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch brand" };
  }
}
export const getVariant = async (brandId: string) => {
  try {
    const response = await axios.get(`/interaction/user/interactions/brands/${brandId}/variants/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch variant" };
  }
}
export const addVehicle = async (Data: any) => {
  try {
    console.log("Data", Data);
    let response = await axios.post('/interaction/user/interactions/vehicles/', Data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log("Backend Error:", error.response.data); // 👈 this shows real reason
      return error.response.data;
    } else {
      console.log("Error:", error.message);
      return { message: error.message };
    }
  }
}

export const getCustomerVehicles = async (customerId: string) => {
  try {
    console.log('Fetching vehicles for customer with id:', customerId);
    const response = await axios.get(`interaction/user/interactions/customers/${customerId}/vehicles/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch customer vehicles" };
  }
}
export const addService = async (Data: any) => {
  try {
    // Add today's date if service_date is missing or empty
    const today = new Date().toISOString().split("T")[0];
    const payload = {
      ...Data,
      service_date: today, // Always overwrite or ensure today's date
    };

    console.log("Payload", payload);

    const response = await axios.post(
      "/interaction/user/interactions/services/",
      payload
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log("Backend Error:", error.response.data);
      return error.response.data;
    } else {
      console.log("Error:", error.message);
      return { message: error.message };
    }
  }
};
 export const getServices = async () => {
  try {
    const response = await axios.get(`/interaction/user/interactions/services/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch services" };
  }
 }

 export const dashBoardMonthly = async () => {
  try {
    const response = await axios.get(`/interaction/user/interactions/services/monthly_stats/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch dashboard data" };
  }
 }
 export const upcommingServices = async () => {
  try {
    const response = await axios.get(`/interaction/user/interactions/services/upcoming/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch upcoming services" };
  }
 }

 export const Dashboard = async () => {
  try {
    const response = await axios.get(`/api/dashboard/stats/`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || { message: "Failed to fetch dashboard data" };
  }
 }