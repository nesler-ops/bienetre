// src/services/pixabayApi.ts
import axios from "axios";

const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const PIXABAY_BASE_URL = "https://pixabay.com/api/";

// Imagen por defecto segura (almacenada en Pixabay o en tu public/)
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/600x400.png?text=Image+indisponible";

export const getFoodImage = async (query: string): Promise<string> => {
  try {
    // ⚠️ Palabras bloqueadas manualmente
    const forbidden = ["soda", "postobon", "valentine", "boisson", "drink"];
    const cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !forbidden.includes(word))
      .slice(0, 1)
      .join(" ");

    if (!cleanQuery) return PLACEHOLDER_IMAGE;

    const response = await axios.get(PIXABAY_BASE_URL, {
      params: {
        key: PIXABAY_API_KEY,
        q: cleanQuery,
        image_type: "photo",
        per_page: 3,
        lang: "fr",
        safesearch: true,
      },
    });

    const hits = response.data.hits;
    return hits.length > 0 ? hits[0].webformatURL : PLACEHOLDER_IMAGE;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    return PLACEHOLDER_IMAGE;
  }
};
