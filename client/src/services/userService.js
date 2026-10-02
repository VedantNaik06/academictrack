import api from "./api";

// resource = "faculty" or "hods"
const userApi = (resource) => ({
  list: async (params = {}) => (await api.get(`/${resource}`, { params })).data,
  create: async (data) => (await api.post(`/${resource}`, data)).data,
  update: async (id, data) => (await api.put(`/${resource}/${id}`, data)).data,
  resetPassword: async (id, password) =>
    (await api.post(`/${resource}/${id}/reset-password`, { password })).data,
  remove: async (id) => (await api.delete(`/${resource}/${id}`)).data,
});

export const facultyApi = userApi("faculty");
export const hodApi = userApi("hods");