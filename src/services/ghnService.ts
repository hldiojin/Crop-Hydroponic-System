import api from "../context/ghnContext";

export const ghnService = {
    getProvinces: async () => {
        const response = await api.get("/province");
        return response.data;
    },
    getDistricts: async (provinceId: string) => {
        const response = await api.get(`/district?province_id=${provinceId}`);
        return response.data;
    },
    getWards: async (districtId: string) => {
        const response = await api.get(`/ward?district_id=${districtId}`);
        return response.data;
    },
}