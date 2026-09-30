import api from "./api";

// params example: { department: "<id>" }
export const getAcademicYears = async (params = {}) =>
  (await api.get("/academic-years", { params })).data;

export const createAcademicYear = async (data) =>
  (await api.post("/academic-years", data)).data;

export const updateAcademicYear = async (id, data) =>
  (await api.put(`/academic-years/${id}`, data)).data;

export const deleteAcademicYear = async (id) =>
  (await api.delete(`/academic-years/${id}`)).data;