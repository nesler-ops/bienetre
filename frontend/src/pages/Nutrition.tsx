// src/pages/Nutrition.tsx
import FoodSearch from "../components/FoodSearch";
import { FaAppleAlt } from "react-icons/fa";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <FaAppleAlt className="text-green-500" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">Nutrition</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Explorez les vitamines, minéraux, fruits et légumes, et découvrez
          leurs apports nutritionnels.
        </p>

        {/* 🔎 Buscador de alimentos y resultados */}
        <FoodSearch />

        {/* 🛑 Disclaimer visible */}
        <div className="mt-6 p-4 text-sm bg-yellow-100 border border-yellow-300 rounded text-gray-700">
          ⚠️ <strong>Avertissement :</strong> Les informations fournies ici sont
          à titre informatif seulement et ne remplacent pas l’avis d’un
          professionnel de la santé. Certains aliments peuvent ne pas convenir à
          tout le monde.
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
