import { useState } from "react";
import { FaBrain } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const phq9Questions = [
  "Peu d'intérêt ou de plaisir à faire les choses",
  "Vous vous sentez déprimé, triste ou sans espoir",
  "Difficultés à vous endormir ou à rester endormi, ou trop dormir",
  "Fatigue ou manque d'énergie",
  "Perte d'appétit ou trop manger",
  "Vous sentez-vous mal dans votre peau, ou pensez que vous êtes un échec",
  "Difficultés à vous concentrer sur des choses, comme lire le journal ou regarder la télévision",
  "Bougez ou parlez si lentement que les autres l’ont remarqué. Ou bien, êtes-vous si agité que vous bougez beaucoup plus que d’habitude",
  "Avez-vous eu des pensées que vous seriez mieux mort ou de vous faire du mal d'une manière ou d'une autre",
];

const Mental = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<number[]>(Array(9).fill(0));
  const [resultatPHQ9, setResultatPHQ9] = useState("");

  const handleChange = (index: number, value: number) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const submitPHQ9 = async () => {
    try {
      const response = await fetch("http://localhost:8000/mental/phq9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: responses }),
      });

      const data = await response.json();
      setResultatPHQ9(data.resultat || "Aucun résultat.");
    } catch (error) {
      console.error("Erreur lors de l’évaluation :", error);
      setResultatPHQ9("Une erreur est survenue. Veuillez réessayer.");
    }
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
          <FaBrain size={32} className="text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-700">Santé mentale</h1>
        </div>
        <p className="text-gray-600">
          Prendre soin de sa santé mentale est aussi important que la santé
          physique. Il est essentiel de reconnaître le stress, l'anxiété et
          d’apprendre à les gérer.
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow max-w-4xl mx-auto mb-6">
        <h2 className="font-semibold text-gray-700 text-lg mb-4">
          🧠 Questionnaire PHQ-9
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Au cours des deux dernières semaines, à quelle fréquence avez-vous été
          dérangé par les problèmes suivants ?
        </p>

        {phq9Questions.map((q, i) => (
          <div key={i} className="mb-4">
            <p className="text-sm font-medium mb-2">
              {i + 1}. {q}
            </p>
            <select
              className="border px-3 py-2 rounded w-full"
              value={responses[i]}
              onChange={(e) => handleChange(i, parseInt(e.target.value))}
            >
              <option value={0}>Pas du tout (0)</option>
              <option value={1}>Plusieurs jours (1)</option>
              <option value={2}>Plus de la moitié des jours (2)</option>
              <option value={3}>Presque tous les jours (3)</option>
            </select>
          </div>
        ))}

        <button
          onClick={submitPHQ9}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Évaluer
        </button>

        {resultatPHQ9 && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded shadow">
            <p className="mb-3 font-semibold">{resultatPHQ9}</p>

            {resultatPHQ9.includes("sévère") && (
              <div className="text-sm text-red-600 space-y-1">
                <p>
                  🆘 Il est fortement conseillé de consulter un professionnel de
                  santé mentale.
                </p>
                <a
                  href="https://www.doctolib.fr/psychiatre"
                  target="_blank"
                  className="underline"
                >
                  Trouver un psychiatre sur Doctolib
                </a>
              </div>
            )}

            {resultatPHQ9.includes("modéré") && (
              <div className="text-sm text-yellow-600 space-y-1">
                <p>
                  💡 Essayez des techniques de relaxation comme le yoga ou la
                  méditation.
                </p>
                <a
                  href="https://www.headspace.com/fr"
                  target="_blank"
                  className="underline"
                >
                  Découvrir des méditations guidées (Headspace)
                </a>
              </div>
            )}

            {resultatPHQ9.includes("léger") && (
              <div className="text-sm text-green-600 space-y-1">
                <p>
                  🌱 Votre état est stable. Continuez à prendre soin de votre
                  bien-être mental.
                </p>
                <a
                  href="https://www.petitbambou.com/fr/"
                  target="_blank"
                  className="underline"
                >
                  Pratiquer la pleine conscience (Petit Bambou)
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-center text-gray-500 mt-8">
        ⚠️ Les résultats sont à titre informatif uniquement. Consultez un
        professionnel en cas de doute ou de besoin.
      </p>
    </div>
  );
};

export default Mental;
