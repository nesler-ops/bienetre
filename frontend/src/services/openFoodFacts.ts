// ✅ src/services/openFoodFacts.ts
export const fetchHydrationSuggestions = async (search: string = "boisson") => {
  const url = "https://world.openfoodfacts.org/cgi/search.pl";
  const params = new URLSearchParams({
    search_terms: search,
    search_simple: "1",
    action: "process",
    json: "1",
    lang: "fr",
    page_size: "30",
    fields: "product_name_fr,brands,image_url,nutriscore_grade,nutriments",
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    return data.products
      .filter((p: any) => p.product_name_fr && p.brands)
      .map((p: any) => ({
        nom: p.product_name_fr,
        marque: p.brands,
        image: p.image_url,
        nutriScore: p.nutriscore_grade,
        nutriments: p.nutriments,
      }));
  } catch (error) {
    console.error("Erreur API OpenFoodFacts :", error);
    return [];
  }
};
