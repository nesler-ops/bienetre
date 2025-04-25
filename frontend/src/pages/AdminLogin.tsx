import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthResponse } from "../services/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      // ✅ Especificamos que `response.data` tendrá la estructura de `AuthResponse`
      const response = await api.post<AuthResponse>(
        "/admin/admin-login",
        formData
      );

      // ✅ Verificamos que la respuesta contenga `user_id`
      if (!response.data || !response.data.token || !response.data.user_id) {
        throw new Error("❌ Datos de admin incompletos en la respuesta.");
      }

      console.log("✅ Sesión de admin guardada correctamente:", response.data);

      sessionStorage.setItem(
        "admin",
        JSON.stringify({
          token: response.data.token,
          username: response.data.username,
          user_type: response.data.user_type,
          user_id: response.data.user_id,
        })
      );

      navigate("/admin-dashboard");
    } catch (error) {
      console.error("❌ Error en el login admin:", error);
      setErrorMessage("Identifiants incorrects.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>

        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
