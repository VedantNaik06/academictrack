import api from "./api";

export const getSyllabus = async (subjectId) =>
  (await api.get("/syllabus", { params: { subject: subjectId } })).data;

export const createTopic = async (data) => (await api.post("/syllabus", data)).data;

export const updateTopic = async (id, data) =>
  (await api.put(`/syllabus/${id}`, data)).data;

export const deleteTopic = async (id) => (await api.delete(`/syllabus/${id}`)).data;