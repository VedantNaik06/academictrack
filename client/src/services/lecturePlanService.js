import api from "./api";

export const getLecturePlans = async (subjectId) =>
  (await api.get("/lecture-plans", { params: { subject: subjectId } })).data;

export const createLecture = async (data) =>
  (await api.post("/lecture-plans", data)).data;

export const updateLecture = async (id, data) =>
  (await api.put(`/lecture-plans/${id}`, data)).data;

export const deleteLecture = async (id) =>
  (await api.delete(`/lecture-plans/${id}`)).data;

export const generateLecturePlan = async (data) =>
  (await api.post("/lecture-plans/generate", data)).data;

export const clearLecturePlan = async (subjectId) =>
  (await api.delete(`/lecture-plans/subject/${subjectId}`)).data;