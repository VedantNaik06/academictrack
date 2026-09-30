import api from "./api";

export const getDepartments = async () => (await api.get("/departments")).data;

export const createDepartment = async (data) =>
  (await api.post("/departments", data)).data;

export const updateDepartment = async (id, data) =>
  (await api.put(`/departments/${id}`, data)).data;

export const deleteDepartment = async (id) =>
  (await api.delete(`/departments/${id}`)).data;