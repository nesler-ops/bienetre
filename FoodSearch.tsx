// src/components/FoodSearch.tsx
import { useState } from "react";
import { searchFood } from "../services/foodApi";
import { getFoodImage } from "../services/pixabayApi";

interface Food {
  description: string;
  brandName?: string;
  foodNutrients: {
    nutrientName: string;
    unitName: string;
    value: number;
  }[];
  imageUrl?: string;
}

const FoodSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchFood(query);
      const updatedResults = await Promise.all(
        data.map(async (food: Food) => {
          const imageUrl = await getFoodImage(food.description);
          return { ...food, imageUrl };
        })
      );
      setResults(updatedResults);
    } catch (error) {
      console.error("Erreur lors de la recherche des aliments :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Recherche nutritionnelle</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Entrez un aliment (ex: pomme)"
          className="border px-3 py-2 rounded w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      {results.map((food, index) => (
        <div key={index} className="border p-4 mb-4 rounded shadow bg-white">
          {food.imageUrl && (
            <img
              src={food.imageUrl}
              alt={food.description}
              className="w-full h-48 object-cover rounded mb-2"
            />
          )}
          <h3 className="font-semibold">{food.description}</h3>
          {food.brandName && <p>Marque : {food.brandName}</p>}

          <ul className="text-sm mt-2">
            {food.foodNutrients.slice(0, 5).map((nutrient, i) => (
              <li key={i}>
                {nutrient.nutrientName}: {nutrient.value} {nutrient.unitName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FoodSearch;
