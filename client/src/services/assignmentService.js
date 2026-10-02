import api from "./api";

export const getAssignments = async (params = {}) =>
  (await api.get("/assignments", { params })).data;

export const createAssignment = async (data) =>
  (await api.post("/assignments", data)).data;

export const deleteAssignment = async (id) =>
  (await api.delete(`/assignments/${id}`)).data;