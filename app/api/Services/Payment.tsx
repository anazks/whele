import axios from '../Axios';

export const getPaymentPlans = async () => {
    try {
        const response = await axios.get('/subscription/plans/');
        return response;
    } catch (error) {
        throw error?.response?.data || { message: "Failed to fetch payments" };   
    }
}

export const createOrder = async ( amount :any) => {
    try {
        console.log('Creating order with amount:', amount);
        const response = await axios.post('/subscription/create-order/', {amount});
        return response;
    } catch (error) {
        throw error?.response?.data || { message: "Failed to create order" };   
    }
}

export const verifyPayment = async (paymentData: any) => {
    try {
        const response = await axios.post('/subscription/verify-payment/', paymentData);
        return response;
    } catch (error) {
        throw error?.response?.data || { message: "Payment verification failed" };   
    }
}