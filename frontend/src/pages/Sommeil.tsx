import { useEffect, useState } from "react";
import { FaBed, FaClock, FaRegSmile, FaNewspaper } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source_id: string;
  description: string;
}

const Sommeil = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [recherche, setRecherche] = useState("sommeil");
  const [quizReponses, setQuizReponses] = useState({
    coucher: "",
    repos: "",
    sieste: "",
  });
  const [resultatQuiz, setResultatQuiz] = useState("");
  const [articleRecommande, setArticleRecommande] = useState<Article | null>(
    null
  );

  const NEWS_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;

  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&language=fr&q=${recherche}`
      );
      const data = await response.json();
      setArticles(data.results || []);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    }
  };

  const evaluerQuiz = () => {
    let score = 0;
    if (quizReponses.coucher === "avant 22h") score++;
    if (quizReponses.repos === "oui") score++;
    if (quizReponses.sieste === "parfois") score++;

    let message = "";
    let motCle = "";

    if (score === 3) {
      message = "😴 Vous avez de très bonnes habitudes de sommeil !";
      motCle = "bienfaits";
    } else if (score === 2) {
      message =
        "🙂 Vos habitudes sont correctes, mais peuvent être améliorées.";
      motCle = "améliorer";
    } else {
      message = "⚠️ Attention : essayez d'améliorer vos habitudes de sommeil.";
      motCle = "trouble";
    }

    setResultatQuiz(message);

    // 🔎 Buscar artículo relacionado (más flexible)
    const articleTrouve =
      articles.find((a) =>
        a.title?.toLowerCase().includes(motCle.toLowerCase())
      ) || articles[0]; // fallback al primero si no hay coincidencia

    setArticleRecommande(articleTrouve || null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Retour à l'accueil
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <FaBed size={32} className="text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-700">Sommeil et Repos</h1>
        </div>
        <p className="text-gray-600">
          Le sommeil est essentiel pour maintenir un bon état de santé physique
          et mentale. Un bon repos aide à renforcer le système immunitaire, à
          améliorer la concentration et à réduire le stress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-blue-500" />
            <h2 className="font-semibold text-gray-700 text-lg">
              Durée de sommeil recommandée
            </h2>
          </div>
          <ul className="text-gray-600 text-sm list-disc list-inside">
            <li>Bébés : 12 à 16 heures</li>
            <li>Enfants : 9 à 12 heures</li>
            <li>Adultes : 7 à 9 heures</li>
            <li>Personnes âgées : 7 à 8 heures</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FaRegSmile className="text-green-500" />
            <h2 className="font-semibold text-gray-700 text-lg">
              Conseils pour mieux dormir
            </h2>
          </div>
          <ul className="text-gray-600 text-sm list-disc list-inside">
            <li>Évitez les écrans 1 heure avant de dormir</li>
            <li>Créez une routine de coucher régulière</li>
            <li>Évitez les repas lourds le soir</li>
            <li>Faites de l'exercice pendant la journée</li>
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow-sm mb-6">
        <h2 className="font-semibold text-gray-700 text-lg mb-2">
          🔍 Rechercher des articles
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="sommeil, insomnie..."
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={fetchArticles}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Rechercher
          </button>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <div key={index} className="border rounded p-3 bg-gray-50">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {article.title}
                </a>
                <p className="text-sm text-gray-600">
                  {new Date(article.pubDate).toLocaleDateString()} •{" "}
                  {article.source_id}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {article.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun article trouvé.</p>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow-sm mb-6">
        <h2 className="font-semibold text-gray-700 text-lg mb-4">
          🧠 Évalue ton sommeil
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              À quelle heure vous couchez-vous ?
            </label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={quizReponses.coucher}
              onChange={(e) =>
                setQuizReponses({ ...quizReponses, coucher: e.target.value })
              }
            >
              <option value="">Sélectionnez</option>
              <option value="avant 22h">Avant 22h</option>
              <option value="entre 22h et minuit">Entre 22h et minuit</option>
              <option value="> minuit">Après minuit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Vous vous sentez reposé au réveil ?
            </label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={quizReponses.repos}
              onChange={(e) =>
                setQuizReponses({ ...quizReponses, repos: e.target.value })
              }
            >
              <option value="">Sélectionnez</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Faites-vous des siestes ?
            </label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={quizReponses.sieste}
              onChange={(e) =>
                setQuizReponses({ ...quizReponses, sieste: e.target.value })
              }
            >
              <option value="">Sélectionnez</option>
              <option value="jamais">Jamais</option>
              <option value="parfois">Parfois</option>
              <option value="souvent">Souvent</option>
            </select>
          </div>

          <button
            onClick={evaluerQuiz}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Voir résultat
          </button>

          {resultatQuiz && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded shadow">
              <p className="mb-2">{resultatQuiz}</p>
              {articleRecommande && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 font-semibold">
                    📚 Article recommandé :
                  </p>
                  <a
                    href={articleRecommande.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    {articleRecommande.title}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-center text-gray-500 mt-8">
        ⚠️ Les informations fournies ici sont à titre informatif uniquement et
        ne remplacent pas les conseils d’un professionnel de santé.
      </p>
    </div>
  );
};

export default Sommeil;
