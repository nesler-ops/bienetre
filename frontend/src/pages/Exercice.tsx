// src/pages/Exercice.tsx
import { useEffect, useState } from "react";
import { FaRunning } from "react-icons/fa";
import {
  getAllExercises,
  getBodyParts,
  getExercisesByBodyPart,
} from "../services/exerciseDbApi";

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
}

const Exercice = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [selectedPart, setSelectedPart] = useState<string>("all");

  useEffect(() => {
    const fetchBodyParts = async () => {
      const parts = await getBodyParts();
      setBodyParts(["all", ...parts]);
    };
    fetchBodyParts();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data =
          selectedPart === "all"
            ? await getAllExercises()
            : await getExercisesByBodyPart(selectedPart);

        setExercises(data.slice(0, 12));
      } catch (error) {
        console.error("Erreur en récupérant les exercices :", error);
      }
    };
    fetchExercises();
  }, [selectedPart]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => history.back()}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Retour à l'accueil
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <FaRunning size={32} className="text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-700">Exercice</h1>
        </div>
        <p className="text-gray-600">
          L’activité physique régulière réduit le risque de maladies chroniques,
          améliore l'humeur et la qualité de vie.
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm max-w-4xl mx-auto mb-8">
        <h2 className="font-semibold text-gray-700 text-lg mb-2">
          Recommandations
        </h2>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>Marchez au moins 30 minutes par jour</li>
          <li>Évitez de rester assis trop longtemps</li>
          <li>Faites des pauses actives si vous travaillez à un bureau</li>
          <li>Essayez des activités douces comme le yoga ou la natation</li>
        </ul>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-4 rounded-lg shadow mb-8">
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
          <label className="font-medium text-gray-700">
            Filtrer par partie du corps:
          </label>
          <select
            className="border px-3 py-2 rounded shadow-sm"
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
          >
            {bodyParts.map((part) => (
              <option key={part} value={part}>
                {part.charAt(0).toUpperCase() + part.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-bold mb-4">Exercices recommandés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div key={ex.id} className="border p-3 rounded shadow bg-white">
              <img
                src={ex.gifUrl}
                alt={ex.name}
                className="w-full h-40 object-contain"
              />
              <h3 className="font-semibold mt-2">{ex.name}</h3>
              <p>Partie du corps : {ex.bodyPart}</p>
              <p>Cible : {ex.target}</p>
              <p>Équipement : {ex.equipment}</p>
              <p className="mt-1 text-xs text-yellow-600">
                🔹 Difficulté : Moyenne | Âge recommandé : Adultes
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        ⚠️ Ces exercices sont fournis à titre informatif uniquement. Veuillez
        consulter un professionnel de santé avant de commencer tout programme
        physique. Certaines activités peuvent ne pas convenir à tout le monde.
      </div>
    </div>
  );
};

export default Exercice;
