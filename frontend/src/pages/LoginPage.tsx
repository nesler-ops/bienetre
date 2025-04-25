import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserSession } from "../services/auth";
import { captureImage } from "../services/faceAuth";

interface LoginResponse {
  message: string;
  user_id: string;
  user_type: "Patient" | "Médecin";
}

interface AuthResponse {
  message: string;
  token: string;
  username: string;
  user_type: "Patient" | "Médecin";
  user_id: string;
}

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"Patient" | "Médecin">("Patient");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📌 Envoi de la demande de connexion à : /auth/login");

      const response = await api.post("/auth/login", {
        username,
        password,
        user_type: userType,
      });

      const data = response.data;

      navigate("/verify-code", {
        state: {
          user_id: data.user_id,
          user_type: data.user_type,
        },
      });
    } catch (error) {
      console.error("❌ Erreur de connexion :", error);
      alert("Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    setLoading(true);

    try {
      const imageBlob = await captureImage();
      if (!imageBlob) throw new Error("Impossible de capturer l'image.");

      const formData = new FormData();
      formData.append("file", imageBlob, "face.jpg");

      console.log("📌 Connexion faciale via /auth/login-face");

      const response = await api.post<AuthResponse>(
        "/auth/login-face",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = response.data;
      setUserSession(data);

      navigate(
        data.user_type === "Patient"
          ? "/dashboard-patient"
          : "/dashboard-medecin"
      );
    } catch (error) {
      console.error("❌ Erreur de reconnaissance faciale :", error);
      alert("Erreur lors de la reconnaissance faciale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        <form onSubmit={handleLogin}>
          <select
            value={userType}
            onChange={(e) =>
              setUserType(e.target.value as "Patient" | "Médecin")
            }
            className="w-full p-2 border rounded mb-4"
          >
            <option value="Patient">Patient</option>
            <option value="Médecin">Médecin</option>
          </select>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Chargement..." : "Se Connecter"}
          </button>
        </form>
        <hr className="my-4" />
        <button
          onClick={handleFaceLogin}
          className="w-full bg-green-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading
            ? "Analyse en cours..."
            : "Se Connecter avec la Reconnaissance Faciale"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
