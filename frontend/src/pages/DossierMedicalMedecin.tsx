import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";

interface DossierMedical {
  _id: string;
  symptomes: string;
  diagnostic: string;
  source_diagnostic: string;
  traitement: string;
  source_traitement: string;
  resume_visite: string;
  date_visite: string;
  patient_id: string;
  medecin_id: string;
  nom?: string;
  prenom?: string;
  etablissement?: string;
  notes_pour_medecins?: string;
  debut_maladie?: string | null;
  fin_maladie?: string | null;
  created_at?: string;
}

const DossierMedicalMedecin = () => {
  const [user, setUser] = useState<{
    username: string;
    user_type: string;
    user_id: string;
  } | null>(null);
  const [dossiers, setDossiers] = useState<DossierMedical[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState<DossierMedical[]>([]);
  const [filters, setFilters] = useState({
    nom: "",
    date: "",
    periodeDebut: "",
    periodeFin: "",
  });
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DossierMedical>>({});

  useEffect(() => {
    const session = getUserSession();
    if (!session || session.user_type !== "Médecin") return;
    setUser(session);

    const fetchDossiers = async () => {
      try {
        const res = await api.get(
          `/dossiersmedicaux/by-medecin/${session.user_id}`
        );
        const dossiers = res.data;

        const dossiersWithNames = await Promise.all(
          dossiers.map(async (d: DossierMedical) => {
            try {
              const p = await api.get(`/patients/${d.patient_id}`);
              return {
                ...d,
                nom: p.data.patient.nom,
                prenom: p.data.patient.prenom,
              };
            } catch {
              return d;
            }
          })
        );

        setDossiers(dossiersWithNames);
        setFiltered(dossiersWithNames);
      } catch (error) {
        console.error("Erreur lors du chargement des dossiers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, []);

  useEffect(() => {
    const search = filters.nom.toLowerCase();
    const result = dossiers.filter((d) => {
      const matchNom =
        d.nom?.toLowerCase().includes(search) ||
        d.prenom?.toLowerCase().includes(search) ||
        search === "";

      const matchDate = filters.date
        ? d.date_visite?.startsWith(filters.date)
        : true;

      const matchPeriode =
        filters.periodeDebut && filters.periodeFin
          ? d.date_visite >= filters.periodeDebut &&
            d.date_visite <= filters.periodeFin
          : true;

      return matchNom && matchDate && matchPeriode;
    });
    setFiltered(result);
  }, [filters, dossiers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (dossierId: string) => {
    if (!user) return;

    try {
      const payload = { ...formData };
      delete payload._id;
      delete payload.nom;
      delete payload.prenom;

      const res = await api.put(`/dossiersmedicaux/${dossierId}`, payload);

      setDossiers((prev) =>
        prev.map((d) => (d._id === dossierId ? { ...d, ...formData } : d))
      );
      setFiltered((prev) =>
        prev.map((d) => (d._id === dossierId ? { ...d, ...formData } : d))
      );

      setIsEditing(null);
      setFormData({});
    } catch (error) {
      console.error("Erreur lors de la mise à jour du dossier:", error);
    }
  };

  const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Dossiers Médicaux de mes Patients
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="nom"
          placeholder="Recherche par nom/prénom"
          value={filters.nom}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <div className="flex gap-2">
          <input
            type="date"
            name="periodeDebut"
            value={filters.periodeDebut}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="date"
            name="periodeFin"
            value={filters.periodeFin}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p>Aucun dossier trouvé.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((dossier) => (
            <div
              key={dossier._id}
              className="bg-white p-6 rounded shadow border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Patient : {dossier.prenom} {dossier.nom}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <p className="text-sm text-gray-500">
                  Date de la visite :{" "}
                  {formatDateForDisplay(dossier.date_visite)}
                </p>
                <p className="text-sm text-gray-500">
                  Établissement : {dossier.etablissement || "Non spécifié"}
                </p>
              </div>

              <div className="space-y-4">
                <label>
                  Symptômes:
                  <textarea
                    value={
                      isEditing === dossier._id
                        ? formData.symptomes ?? dossier.symptomes
                        : dossier.symptomes
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        symptomes: e.target.value,
                      }))
                    }
                    readOnly={isEditing !== dossier._id}
                    className="w-full border p-2 rounded mt-1"
                  />
                </label>

                <label>
                  Diagnostic:
                  <textarea
                    value={
                      isEditing === dossier._id
                        ? formData.diagnostic ?? dossier.diagnostic
                        : dossier.diagnostic
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        diagnostic: e.target.value,
                      }))
                    }
                    readOnly={isEditing !== dossier._id}
                    className="w-full border p-2 rounded mt-1"
                  />
                  <p className="text-sm italic text-blue-500">
                    🧠 Origine: {dossier.source_diagnostic || "Non spécifié"}
                  </p>
                </label>

                <label>
                  Traitement:
                  <textarea
                    value={
                      isEditing === dossier._id
                        ? formData.traitement ?? dossier.traitement
                        : dossier.traitement
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        traitement: e.target.value,
                      }))
                    }
                    readOnly={isEditing !== dossier._id}
                    className="w-full border p-2 rounded mt-1"
                  />
                  <p className="text-sm italic text-purple-500">
                    💊 Origine: {dossier.source_traitement || "Non spécifié"}
                  </p>
                </label>

                <label>
                  Résumé de la visite:
                  <textarea
                    value={
                      isEditing === dossier._id
                        ? formData.resume_visite ?? dossier.resume_visite
                        : dossier.resume_visite
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        resume_visite: e.target.value,
                      }))
                    }
                    readOnly={isEditing !== dossier._id}
                    className="w-full border p-2 rounded mt-1"
                  />
                </label>

                <label>
                  Notes pour médecins:
                  <textarea
                    value={
                      isEditing === dossier._id
                        ? formData.notes_pour_medecins ??
                          dossier.notes_pour_medecins
                        : dossier.notes_pour_medecins
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes_pour_medecins: e.target.value,
                      }))
                    }
                    readOnly={isEditing !== dossier._id}
                    className="w-full border p-2 rounded mt-1"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label>
                    Début maladie:
                    <input
                      type="date"
                      value={
                        isEditing === dossier._id
                          ? formData.debut_maladie ??
                            formatDateForInput(dossier.debut_maladie)
                          : formatDateForInput(dossier.debut_maladie)
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          debut_maladie: e.target.value,
                        }))
                      }
                      readOnly={isEditing !== dossier._id}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </label>

                  <label>
                    Fin maladie:
                    <input
                      type="date"
                      value={
                        isEditing === dossier._id
                          ? formData.fin_maladie ??
                            formatDateForInput(dossier.fin_maladie)
                          : formatDateForInput(dossier.fin_maladie)
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fin_maladie: e.target.value,
                        }))
                      }
                      readOnly={isEditing !== dossier._id}
                      className="w-full border p-2 rounded mt-1"
                    />
                  </label>
                </div>
              </div>

              <div className="text-right mt-4 space-x-2">
                {isEditing === dossier._id ? (
                  <>
                    <button
                      onClick={() => handleSave(dossier._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(dossier._id);
                      setFormData(dossier);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DossierMedicalMedecin;
