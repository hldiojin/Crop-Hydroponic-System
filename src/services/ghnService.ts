import api from "../context/AuthContext";

export const ghnService = {
    getProvinces: async () => {
        const response = await api.get("/ghn/province");
        return response.data;
    },
    getDistricts: async (provinceId: string) => {
        const response = await api.get(`/ghn/district?provinceId=${provinceId}`);
        return response.data;
    },
    getWards: async (districtId: string) => {
        const response = await api.get(`/ghn/ward?districtId=${districtId}`);
        return response.data;
    },
}