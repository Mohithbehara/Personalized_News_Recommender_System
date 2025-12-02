import axiosClient from "./axiosClient";

// Backend mounts rec_router with prefix "/api/v1/recommendations"
// and the router itself has prefix "/recommend", so the final path is:
// GET /api/v1/recommendations/recommend/{user_id}
export const getHybridRecommendation = (userId) => {
  return axiosClient.get(`/recommendations/recommend/${userId}`);
};
