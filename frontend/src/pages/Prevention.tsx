// ✅ src/pages/Prevention.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSyringe,
  FaSmokingBan,
  FaClinicMedical,
  FaArrowLeft,
  FaExternalLinkAlt,
} from "react-icons/fa";

const Prevention = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const healthSections = [
    {
      id: "vaccination",
      title: "Vaccinations Essentielles",
      icon: <FaSyringe className="text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                📅 Calendrier vaccinal 2024
              </h3>
              <a
                href="https://www.msss.gouv.qc.ca/professionnels/vaccination/piq-calendriers-de-vaccination/calendrier-regulier-de-vaccination/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
              >
                Site officiel
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Enfants (0-6 ans):</strong> DTP, Haemophilus
                  influenzae, Hépatite B
                </li>
                <li>
                  <strong>Adolescents (11-13 ans):</strong> HPV, Méningocoque
                </li>
                <li>
                  <strong>Adultes:</strong> Rappel DTP tous les 20 ans, Grippe
                  annuelle
                </li>
                <li>
                  <strong>Voyageurs:</strong> Fièvre jaune, Typhoïde, Hépatite A
                </li>
              </ul>
              <img
                src="/schedule.png"
                alt="Calendrier vaccinal"
                className="w-full h-auto rounded-lg  border-gray-100 scale-[0.7]"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">💉 Nouveaux vaccins</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium">Vaccin COVID-19 mise à jour</h4>
                <p className="text-sm">
                  Protection contre les variants récents
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium">Vaccin RSV</h4>
                <p className="text-sm">Pour personnes âgées et nourrissons</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "smoking",
      title: "Arrêter de Fumer",
      icon: <FaSmokingBan className="text-red-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              🚭 Méthodes Efficaces
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">1. Substituts nicotiniques</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Patchs (16h ou 24h)</li>
                  <li>Gommes à mâcher</li>
                  <li>Spray buccal</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">2. Applications mobiles</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Smoke Free</li>
                  <li>Kwit</li>
                  <li>Tabac Info Service</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">📞 Aide immédiate</h4>
              <p className="mb-2">Service Tabac Info Service :</p>
              <a href="tel:3989" className="text-blue-600 font-semibold">
                39 89
              </a>
              <p className="mt-2">
                <a
                  href="https://www.gosmokefree.gc.ca/quit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  www.gosmokefree.gc.ca/quit
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              📈 Avantages de l'arrêt
            </h3>
            <div className="flex items-center gap-4">
              <img
                src="/smoker.jpg"
                alt="Comparaison santé fumeur/non-fumeur"
                className="w-1/3 rounded-lg"
              />
              <ul className="list-disc pl-4 space-y-2 flex-1">
                <li>Amélioration respiratoire en 72h</li>
                <li>Risque cardiaque réduit de 50% en 1 an</li>
                <li>Économie moyenne : 300€/mois</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "std",
      title: "Prévention IST",
      icon: <FaClinicMedical className="text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              🔍 Dépistage régulier
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="font-medium">VIH</p>
                <p className="text-sm">
                  Tous les 3 mois si partenaires multiples
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Hépatites</p>
                <p className="text-sm">Test sanguin annuel</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium">Chlamydia</p>
                <p className="text-sm">Dépistage urinaire simple</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              🛡️ Méthodes de protection
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Prévention physique</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Préservatifs masculins/féminins</li>
                  <li>Digues dentaires</li>
                  <li>Vaccin HPV (jusqu'à 45 ans)</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Prévention médicale</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>PrEP pour le VIH</li>
                  <li>Traitement post-exposition</li>
                  <li>Antirétroviraux</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              📋 Où se faire dépister ?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium">Centres gratuits</h4>
                <p className="text-sm mt-2">Centres de dépistage anonymes :</p>
                <a
                  href="https://www.sida-info-service.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline block mt-2"
                >
                  Trouver un centre
                </a>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium">Auto-tests</h4>
                <p className="text-sm mt-2">Disponibles en pharmacie :</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>VIH (résultat en 15min)</li>
                  <li>COVID-19</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
      >
        <FaArrowLeft /> Retour à l'accueil
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FaClinicMedical className="text-blue-500" />
          Guide Pratique de Prévention
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {healthSections.map((section) => (
            <button
              key={section.id}
              onClick={() =>
                setActiveSection(
                  activeSection === section.id ? null : section.id
                )
              }
              className={`p-4 rounded-lg flex items-center gap-3 transition-all ${
                activeSection === section.id
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              {section.icon}
              <span className="text-lg">{section.title}</span>
            </button>
          ))}
        </div>

        {healthSections.map(
          (section) =>
            activeSection === section.id && (
              <div key={section.id} className="animate-fadeIn">
                {section.content}
              </div>
            )
        )}

        {!activeSection && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <img
              src="/health-prevention.jpg"
              alt="Prévention santé"
              className="w-full max-w-md mx-auto mb-6 rounded-lg"
            />
            <h2 className="text-2xl font-semibold mb-4">
              Choisissez une catégorie pour voir les conseils de prévention
            </h2>
            <p className="text-gray-600">
              Information vérifiée par des professionnels de santé • Mise à jour
              mensuelle
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prevention;
