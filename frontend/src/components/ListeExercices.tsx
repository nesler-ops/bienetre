// ✅ src/components/ListeExercices.tsx
import { useEffect, useState } from "react";
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

const getDifficultyAndAge = (exercise: Exercise) => {
  const equip = exercise.equipment.toLowerCase();
  const part = exercise.bodyPart.toLowerCase();

  let level = "Facile";
  let age = "Tous âges 👶🧓";

  if (["barbell", "cable", "dumbbell"].includes(equip)) {
    level = "Avancé";
    age = "Adultes 💪";
  } else if (["leverage machine", "resistance band"].includes(equip)) {
    level = "Moyen";
    age = "Aînés 🧓";
  } else if (["neck", "waist"].includes(part)) {
    level = "Facile";
    age = "Enfants / Aînés 🧒🧓";
  }

  return { level, age };
};

const ListeExercices = () => {
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
    <div className="p-4">
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
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

      <h2 className="text-xl font-bold mb-4">Exercices Populaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((ex) => {
          const { level, age } = getDifficultyAndAge(ex);
          return (
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
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Difficulté : {level}
              </span>
              <span className="ml-2 inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                {age}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-sm text-gray-500 text-center border-t pt-4">
        ⚠️ Les exercices présentés ici sont fournis à titre informatif. Veuillez
        consulter un professionnel de la santé avant de commencer tout programme
        d'exercice. Certains mouvements peuvent ne pas convenir à toutes les
        personnes.
      </div>
    </div>
  );
};

export default ListeExercices;
