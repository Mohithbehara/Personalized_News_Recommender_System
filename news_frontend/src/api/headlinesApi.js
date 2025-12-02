import axiosClient from "./axiosClient";

// Fetch paginated headlines for a given category
// Matches backend route: GET /api/v1/headlines/{category}
export const fetchHeadlinesByCategory = (
  category,
  page = 1,
  pageSize = 5
) => {
  return axiosClient.get(`/headlines/${category}`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
};


