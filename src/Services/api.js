import axios from 'axios';

const API_URL = 'https://backend-obras-k2b7.onrender.com'

export const api = axios.create({
    baseURL: API_URL,
    timeout:120000,
});
