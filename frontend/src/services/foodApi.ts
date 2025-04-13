// src/services/foodApi.ts
import axios from "axios";

const API_KEY = import.meta.env.VITE_USDA_API_KEY;
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export const searchFood = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/foods/search`, {
    params: {
      api_key: API_KEY,
      query,
      pageSize: 5, // max 5 résultats
    },
  });

  return response.data.foods;
};
