import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserSession } from "../services/auth";

interface MedecinType {
  _id: string;
  nom: string;
  specialite: string;
  user_id: string;
}

interface RendezvousForm {
  date: string;
  heure: string;
  medecin_id: string;
  type: string;
  motif: string;
  visite_faite: string;
}

const CreateRendezvous = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RendezvousForm>({
    date: "",
    heure: "",
    medecin_id: "",
    type: "",
    motif: "",
    visite_faite: "",
  });

  const [medecins, setMedecins] = useState<MedecinType[]>([]);
  const [heuresDisponibles, setHeuresDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const response = await api.get<MedecinType[]>("/medecins");
        setMedecins(response.data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des médecins :",
          error
        );
      }
    };

    fetchMedecins();
  }, []);

  useEffect(() => {
    const fetchDisponibilites = async () => {
      const { medecin_id, date } = formData;
      if (!medecin_id || !date) return;

      // ⬇️ Reemplaza aquí
      const dateParts = date.split("-");
      const jsDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
      );
      const jours = [
        "dimanche",
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
      ];
      const jour = jours[jsDate.getDay()];
      console.log("📅 Jour détecté:", jour);

      try {
        console.log("📅 Jour détecté:", jour);
        const dispoResponse = await api.get(
          `/disponibilites/${medecin_id}/${jour}`
        );
        const occupeesResponse = await api.get(
          `/rendezvous/occupees/${medecin_id}/${date}`
        );

        const toutes = dispoResponse.data.heures as string[];
        const occupees = occupeesResponse.data.occupees as string[];

        const libres = toutes.filter((h) => !occupees.includes(h));
        setHeuresDisponibles(libres);
      } catch (error) {
        setHeuresDisponibles([]);
        console.error(
          "❌ Erreur lors de la récupération des heures disponibles :",
          error
        );
      }
    };

    fetchDisponibilites();
  }, [formData.date, formData.medecin_id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === "date" || name === "medecin_id" ? { heure: "" } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación para fechas pasadas
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    if (selectedDate < today) {
      alert("❌ No se puede crear una cita en una fecha pasada");
      return;
    }

    setLoading(true);

    const user = getUserSession();
    if (!user || !user.user_id) {
      console.error("❌ Aucun utilisateur authentifié.");
      setLoading(false);
      return;
    }

    const rendezvousData = {
      ...formData,
      patient_id: user.user_id,
    };

    try {
      const response = await api.post("/rendezvous/", rendezvousData);
      setSuccessMessage("✅ Rendez-vous créé avec succès !");
      setTimeout(() => navigate("/dashboard-patient"), 2000);
    } catch (error: any) {
      console.error("❌ Erreur lors de la création du rendez-vous :", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener la fecha actual en formato YYYY-MM-DD para el atributo min
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 pt-16">
      <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          Créer un Rendez-vous
        </h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
            min={today}
          />

          <select
            name="medecin_id"
            value={formData.medecin_id}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Sélectionner un Médecin</option>
            {medecins.map((medecin) => (
              <option key={medecin.user_id} value={medecin.user_id}>
                {medecin.nom} - {medecin.specialite}
              </option>
            ))}
          </select>

          <select
            name="heure"
            value={formData.heure}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
            disabled={!formData.medecin_id || !formData.date}
          >
            <option value="">Sélectionner une Heure</option>
            {heuresDisponibles.map((heure) => (
              <option key={heure} value={heure}>
                {heure}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Type de consultation</option>
            <option value="Consultation générale">Consultation Générale</option>
            <option value="Examen de routine">Examen de Routine</option>
            <option value="Urgence">Urgence</option>
          </select>

          <textarea
            name="motif"
            placeholder="Motif du rendez-vous"
            value={formData.motif}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Création en cours..." : "Créer un Rendez-vous"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRendezvous;
