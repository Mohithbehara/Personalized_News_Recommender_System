import axiosClient from "./axiosClient";

export const fetchNewsByTopic = (topic, page = 1, pageSize = 5) => {
  return axiosClient.get(`/news/${topic}`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
};
