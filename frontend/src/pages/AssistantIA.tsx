import { useState } from "react";
import axios from "axios";
import { FaRobot, FaStethoscope } from "react-icons/fa";

const AssistantIA = () => {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/assistant-ia/", {
        symptoms,
      });

      const result = res.data.response;
      if (result && result.trim() !== "Pas de réponse.") {
        setResponse(result.trim());
      } else {
        setResponse("Pas de réponse utile de l'IA pour cette requête.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto mt-20">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FaRobot /> Assistant IA Médical
      </h1>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg resize-none"
        rows={5}
        placeholder="Décrivez les symptômes du patient ici..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white mt-4 px-6 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
      >
        <FaStethoscope />
        {loading ? "Analyse..." : "Analyser les symptômes"}
      </button>

      {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}

      {response && (
        <div className="mt-6 p-4 border border-green-400 bg-green-50 rounded-lg">
          <h2 className="font-bold text-lg mb-2">🧠 Réponse de l'IA :</h2>
          <p className="whitespace-pre-line">{response}</p>
          <p className="mt-4 text-sm text-gray-600 italic">
            ⚠️ Ce diagnostic est généré par une IA et ne remplace pas l’avis
            d’un professionnel de santé.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssistantIA;
