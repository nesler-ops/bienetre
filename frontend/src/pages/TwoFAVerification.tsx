import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserSession } from "../services/auth";

const TwoFAVerification = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { user_id, user_type } = location.state || {};

  if (!user_id || !user_type) {
    return (
      <div className="text-center mt-10 text-red-600">
        ⚠️ Données manquantes. Veuillez vous reconnecter.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/verify-code", {
        user_id,
        user_type,
        code,
      });

      const data = res.data;
      setUserSession(data); // ✅ Stocker token, username, etc.

      navigate(
        data.user_type === "Patient"
          ? "/dashboard-patient"
          : "/dashboard-medecin"
      );
    } catch (err) {
      console.error("❌ Erreur de vérification :", err);
      setErrorMsg("Code invalide ou expiré. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
          Vérification en 2 étapes
        </h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Un code de vérification a été envoyé à votre adresse email.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          {errorMsg && (
            <p className="text-red-600 text-sm mb-2 text-center">{errorMsg}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Vérification..." : "Vérifier le Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFAVerification;
