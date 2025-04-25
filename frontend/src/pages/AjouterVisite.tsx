import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

interface Rendezvous {
  _id: string;
  date: string;
  heure: string;
  type: string;
  patient_id: string;
  medecin_id: string;
  motif: string;
}

interface Allergy {
  _id: string;
  substance: string;
  reaction?: string;
  gravité?: string;
  notes?: string;
}

const etablissements = [
  "Emplacement du centre médical",
  "Mont Royal",
  "Vieux-Montréal",
  "Marché Atwater",
];

const AjouterVisite = () => {
  const { rendezvous_id } = useParams();
  const navigate = useNavigate();

  const [rendezvous, setRendezvous] = useState<Rendezvous | null>(null);
  const [form, setForm] = useState({
    etablissement: "",
    date_visite: "",
    symptomes: "",
    diagnostic: "",
    source_diagnostic: "manuel",
    traitement: "",
    source_traitement: "manuel",
    resume_visite: "",
    notes_pour_medecins: "",
    debut_maladie: "",
    fin_maladie: "",
  });
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingTraitement, setLoadingTraitement] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  useEffect(() => {
    const fetchRendezvous = async () => {
      try {
        const response = await api.get(`/rendezvous/by-id/${rendezvous_id}`);
        const rdv = response.data;
        if (rdv) {
          setRendezvous(rdv);
          setForm((prev) => ({ ...prev, date_visite: rdv.date }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement du rendez-vous :", error);
      }
    };
    fetchRendezvous();
  }, [rendezvous_id]);

  useEffect(() => {
    const fetchAllergies = async () => {
      if (showAllergies && rendezvous?.patient_id) {
        try {
          const res = await api.get(`/allergies/user/${rendezvous.patient_id}`);
          setAllergies(res.data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des allergies :",
            error
          );
        }
      }
    };
    fetchAllergies();
  }, [showAllergies, rendezvous]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rendezvous) return;

    try {
      await api.post("/visites", {
        patient_id: rendezvous.patient_id,
        medecin_id: rendezvous.medecin_id,
        ...form,
      });

      await api.put(`/rendezvous/${rendezvous._id}`, {
        visite_faite: true,
        statut: "Confirmé",
      });

      navigate("/dashboard-medecin");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la visite :", error);
    }
  };

  const handleIA = async () => {
    if (!form.symptomes.trim()) return;
    try {
      setLoadingIA(true);
      const res = await api.post("/assistant-ia/diagnostic-ia", {
        symptomes: form.symptomes,
      });
      setForm((prev) => ({
        ...prev,
        diagnostic: res.data.diagnostic,
        source_diagnostic: "IA",
      }));
    } catch (error) {
      console.error("Erreur IA diagnostic :", error);
    } finally {
      setLoadingIA(false);
    }
  };

  const handleTraitementIA = async () => {
    if (!form.diagnostic.trim()) return;
    try {
      setLoadingTraitement(true);
      const res = await api.post("/assistant-ia/traitement-ia", {
        diagnostic: form.diagnostic,
      });
      setForm((prev) => ({
        ...prev,
        traitement: res.data.traitement,
        source_traitement: "IA",
      }));
    } catch (error) {
      console.error("Erreur IA traitement :", error);
    } finally {
      setLoadingTraitement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Ajouter une Visite Médicale
        </h2>

        {rendezvous && (
          <p className="text-sm text-gray-500 mb-4 text-center">
            Motif: {rendezvous.motif} | Rendez-vous: {rendezvous.date} à{" "}
            {rendezvous.heure}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <label className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={showAllergies}
              onChange={() => setShowAllergies(!showAllergies)}
            />
            Voir les allergies du patient
          </label>

          {showAllergies && (
            <ul className="list-disc ml-6 text-red-600">
              {allergies.length === 0 ? (
                <li>Aucune allergie connue</li>
              ) : (
                allergies.map((a) => (
                  <li key={a._id}>
                    {a.substance} {a.reaction && `- ${a.reaction}`}{" "}
                    {a.gravité && `(${a.gravité})`}
                  </li>
                ))
              )}
            </ul>
          )}

          <label>
            Établissement visité:
            <select
              name="etablissement"
              value={form.etablissement}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded mt-1"
            >
              <option value="">Sélectionner un établissement</option>
              {etablissements.map((etab, i) => (
                <option key={i} value={etab}>
                  {etab}
                </option>
              ))}
            </select>
          </label>

          <label>
            Symptômes:
            <textarea
              name="symptomes"
              value={form.symptomes}
              onChange={handleChange}
              placeholder="Décrivez ici les symptômes observés"
              className="w-full border p-2 rounded mt-1"
              rows={4}
            />
          </label>

          <button
            type="button"
            onClick={handleIA}
            disabled={loadingIA || !form.symptomes.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {loadingIA ? "Analyse IA..." : "Suggérer un diagnostic IA"}
          </button>

          <label>
            Résumé de la visite:
            <textarea
              name="resume_visite"
              value={form.resume_visite}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded mt-1"
            />
          </label>

          <label>
            Diagnostic:
            <textarea
              name="diagnostic"
              value={form.diagnostic}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              rows={3}
            />
            {form.source_diagnostic === "IA" && (
              <p className="text-sm text-blue-500 italic">
                🧠 Diagnostic suggéré par IA
              </p>
            )}
          </label>

          <button
            type="button"
            onClick={handleTraitementIA}
            disabled={loadingTraitement || !form.diagnostic.trim()}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            {loadingTraitement
              ? "Génération IA..."
              : "Suggérer un traitement IA"}
          </button>

          <label>
            Traitement:
            <textarea
              name="traitement"
              value={form.traitement}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              rows={3}
            />
            {form.source_traitement === "IA" && (
              <p className="text-sm text-purple-500 italic">
                💊 Traitement suggéré par IA
              </p>
            )}
          </label>

          <label>
            Notes pour autres médecins:
            <textarea
              name="notes_pour_medecins"
              value={form.notes_pour_medecins}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </label>

          <label>
            Début de la maladie:
            <input
              type="date"
              name="debut_maladie"
              value={form.debut_maladie}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </label>

          <label>
            Fin de la maladie:
            <input
              type="date"
              name="fin_maladie"
              value={form.fin_maladie}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
          >
            Enregistrer la visite
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjouterVisite;
