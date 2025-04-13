import axios from "axios";
import { getUserSession } from "./auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // ✅ Vérifiez que cette URL est correcte
});

// ✅ Intercepteur pour ajouter le token à toutes les requêtes
api.interceptors.request.use((config) => {
  const user = getUserSession();

  if (!config.headers) {
    config.headers = {};
  }

  if (user && user.token) {
    console.log("✅ Envoi du jeton dans la requête :", `Bearer ${user.token}`);
    config.headers.Authorization = `Bearer ${user.token}`;
  } else {
    console.warn("⚠️ Aucun jeton trouvé dans la session.");
  }

  return config;
});

export default api;
