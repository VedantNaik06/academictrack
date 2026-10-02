import api from "./api";

export const getSubjects = async (params = {}) =>
  (await api.get("/subjects", { params })).data;

export const createSubject = async (data) =>
  (await api.post("/subjects", data)).data;

export const updateSubject = async (id, data) =>
  (await api.put(`/subjects/${id}`, data)).data;

export const deleteSubject = async (id) =>
  (await api.delete(`/subjects/${id}`)).data;