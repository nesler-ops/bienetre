import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Importation d'axios pour typer l'erreur
import api from "../services/api";

// Interface pour définir la structure de l'erreur
interface ErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const RegisterMedecin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { ...formData, user_type: "Médecin" });
      alert("Inscription réussie. Vous pouvez maintenant vous connecter.");
      navigate("/");
    } catch (error) {
      // Vérification si c'est une erreur Axios
      if (axios.isAxiosError(error)) {
        const err = error as ErrorResponse;
        alert(err.response?.data?.detail || "Erreur lors de l'inscription");
      } else {
        // Gestion des erreurs génériques
        alert("Une erreur inattendue s'est produite");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-green-100">
      <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          Inscription Médecin
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterMedecin;
