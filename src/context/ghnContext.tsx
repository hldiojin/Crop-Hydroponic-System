import axios from "axios";
const api = axios.create({
    baseURL: "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});


api.interceptors.request.use(
    (config) => {
        config.headers.set("Token", `ba593433-10f8-11f0-95d0-0a92b8726859`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;