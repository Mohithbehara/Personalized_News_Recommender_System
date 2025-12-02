import axiosClient from "./axiosClient";

export const sendInteraction = (data) => {
  return axiosClient.post(`/interactions/add`, data);
};

export const getSavedArticles = (userId) => {
  return axiosClient.get(`/interactions/saved/${userId}`);
};