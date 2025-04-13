import { useEffect, useState } from "react";
import { fetchHydrationSuggestions } from "../services/openFoodFacts";
import { FaWater } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Product {
  nom: string;
  marque: string;
  image?: string;
  nutriScore?: string;
  nutriments?: {
    energy_kcal?: number;
    sugars?: number;
    salt?: number;
    proteins?: number;
  };
}

const nutriColors: Record<string, string> = {
  a: "bg-green-600",
  b: "bg-lime-500",
  c: "bg-yellow-400",
  d: "bg-orange-500",
  e: "bg-red-600",
};

const Hydratation = () => {
  const [produits, setProduits] = useState<Product[]>([]);
  const [chargement, setChargement] = useState(true);
  const [motCle, setMotCle] = useState("boisson");
  const navigate = useNavigate();

  const chercherProduits = async (mot: string) => {
    setChargement(true);
    const resultats = await fetchHydrationSuggestions(mot);
    setProduits(resultats);
    setChargement(false);
  };

  useEffect(() => {
    chercherProduits(motCle);
  }, []);

  const handleRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    chercherProduits(motCle);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Retour à l'accueil
      </button>

      <form
        onSubmit={handleRecherche}
        className="flex justify-center gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Rechercher (eau, jus, etc.)"
          value={motCle}
          onChange={(e) => setMotCle(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm w-72"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Rechercher
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FaWater className="text-cyan-500" size={24} />
            <h2 className="text-xl font-bold text-gray-700">Hydratation</h2>
          </div>
          <p className="text-gray-600">
            L’eau est essentielle au bon fonctionnement du corps humain. Une
            bonne hydratation soutient la digestion, la circulation et la
            régulation de la température.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
          <h2 className="font-semibold text-gray-700 text-lg mb-2">
            Conseils pour bien s'hydrater
          </h2>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>Buvez entre 1,5 et 2 litres d’eau par jour</li>
            <li>Augmentez votre consommation lors d’activités physiques</li>
            <li>Consommez des aliments riches en eau (concombre, pastèque…)</li>
          </ul>
        </div>
      </div>

      {chargement ? (
        <p className="text-center text-gray-600">Chargement en cours...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produits.map((p, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.nom}
                  className="w-24 h-24 object-contain mx-auto mb-3"
                />
              )}
              <h3 className="text-lg font-semibold text-center text-gray-800">
                {p.nom}
              </h3>
              <p className="text-sm text-center text-gray-500 mb-2">
                {p.marque}
              </p>

              {p.nutriScore && (
                <div className="text-center mb-2">
                  <span
                    className={`text-white text-xs px-3 py-1 rounded-full font-medium ${
                      nutriColors[p.nutriScore.toLowerCase()]
                    }`}
                  >
                    Nutri-Score {p.nutriScore.toUpperCase()}
                  </span>
                </div>
              )}

              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {p.nutriments?.energy_kcal !== undefined &&
                  p.nutriments.energy_kcal > 0 && (
                    <li>🔥 Énergie : {p.nutriments.energy_kcal} kcal</li>
                  )}
                {p.nutriments?.sugars !== undefined &&
                  p.nutriments.sugars > 0 && (
                    <li>🍬 Sucres : {p.nutriments.sugars} g</li>
                  )}
                {p.nutriments?.salt !== undefined && p.nutriments.salt > 0 && (
                  <li>🧂 Sel : {p.nutriments.salt} g</li>
                )}
                {p.nutriments?.proteins !== undefined &&
                  p.nutriments.proteins > 0 && (
                    <li>🥚 Protéines : {p.nutriments.proteins} g</li>
                  )}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-center text-gray-500 mt-12 max-w-3xl mx-auto">
        ⚠️ Les informations affichées proviennent de sources ouvertes et sont
        fournies à titre indicatif uniquement. Cette page ne remplace pas l’avis
        d’un professionnel de santé qualifié.
      </p>
    </div>
  );
};

export default Hydratation;
