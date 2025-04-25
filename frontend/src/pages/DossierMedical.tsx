import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";

interface DossierMedical {
  _id: string;
  patient_id: string;
  medecin_id: string;
  etablissement: string;
  date_visite: string;
  symptomes?: string;
  diagnostic?: string;
  traitement?: string;
  source_diagnostic?: string;
  source_traitement?: string;
  resume_visite: string;
  notes_pour_medecins?: string;
  debut_maladie?: string;
  fin_maladie?: string;
}

const DossierMedical = () => {
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [filtered, setFiltered] = useState<DossierMedical[]>([]);
  const [filters, setFilters] = useState({
    date: "",
    periodeDebut: "",
    periodeFin: "",
  });

  useEffect(() => {
    const session = getUserSession();
    const patientId = session?.user_id;
    if (!patientId || session.user_type !== "Patient") return;

    const fetchDossiers = async () => {
      try {
        const res = await api.get(`/dossiersmedicaux/${patientId}`);
        setDossiers(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des dossiers :", error);
      }
    };

    fetchDossiers();
  }, []);

  useEffect(() => {
    const result = dossiers.filter((d) => {
      const matchDate = filters.date
        ? d.date_visite.startsWith(filters.date)
        : true;

      const matchPeriode =
        filters.periodeDebut && filters.periodeFin
          ? d.date_visite >= filters.periodeDebut &&
            d.date_visite <= filters.periodeFin
          : true;

      return matchDate && matchPeriode;
    });
    setFiltered(result);
  }, [filters, dossiers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Mon Dossier Médical
        </h2>

        <div className="text-sm text-gray-500 mb-4">
          🔍 Utilisez les filtres ci-dessous pour rechercher une visite par date
          précise ou période.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Date précise"
          />
          <input
            type="date"
            name="periodeDebut"
            value={filters.periodeDebut}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Début de période"
          />
          <input
            type="date"
            name="periodeFin"
            value={filters.periodeFin}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Fin de période"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucun dossier médical disponible pour les filtres sélectionnés.
          </p>
        ) : (
          filtered.map((dossier) => (
            <div
              key={dossier._id}
              className="border border-gray-300 rounded p-4 mb-6 shadow-sm bg-white"
            >
              <p className="text-sm text-gray-500">
                📅 Date de la visite :{" "}
                {new Date(dossier.date_visite).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                🏥 Établissement :{" "}
                <strong>{dossier.etablissement || "Non spécifié"}</strong>
              </p>

              <label>
                Symptômes:
                <textarea
                  value={dossier.symptomes || ""}
                  readOnly
                  className="w-full border p-2 rounded mt-1 mb-2"
                />
              </label>

              <label>
                Diagnostic:
                <textarea
                  value={dossier.diagnostic || ""}
                  readOnly
                  className="w-full border p-2 rounded mt-1"
                />
                {dossier.source_diagnostic === "IA" && (
                  <p className="text-blue-500 italic mt-1">🧠 Généré par IA</p>
                )}
              </label>

              <label className="block mt-4">
                Traitement:
                <textarea
                  value={dossier.traitement || ""}
                  readOnly
                  className="w-full border p-2 rounded mt-1"
                />
                {dossier.source_traitement === "IA" && (
                  <p className="text-purple-500 italic mt-1">
                    💊 Suggéré par IA
                  </p>
                )}
              </label>

              <label className="block mt-4">
                Résumé de la visite:
                <textarea
                  value={dossier.resume_visite}
                  readOnly
                  className="w-full border p-2 rounded mt-1"
                />
              </label>

              {dossier.notes_pour_medecins && (
                <label className="block mt-4">
                  Notes pour médecins:
                  <textarea
                    value={dossier.notes_pour_medecins}
                    readOnly
                    className="w-full border p-2 rounded mt-1"
                  />
                </label>
              )}

              {(dossier.debut_maladie || dossier.fin_maladie) && (
                <p className="text-sm text-gray-600 mt-4">
                  🦠 Période de maladie :{" "}
                  {dossier.debut_maladie
                    ? `du ${formatDateForInput(dossier.debut_maladie)} `
                    : ""}
                  {dossier.fin_maladie
                    ? `au ${formatDateForInput(dossier.fin_maladie)}`
                    : ""}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DossierMedical;
