import { useState, useEffect } from "react";
import api from "../services/api";

interface MedecinType {
  _id: string;
  nom: string;
  user_id: string; // 🔹 Identificador del médico (no confundir con _id de la colección medecins)
}

interface EditRendezVousModalProps {
  appointment: {
    _id: string;
    date: string;
    heure: string;
    type: string;
    medecin_id: string;
  };
  onClose: () => void;
  onUpdate: (updatedAppointment: {
    _id: string;
    date: string;
    heure: string;
    type: string;
    medecin_id: string;
  }) => void;
  canEditStatut?: boolean;
}

const EditRendezVousModal = ({
  appointment,
  onClose,
  onUpdate,
  canEditStatut = false,
}: EditRendezVousModalProps) => {
  const [formData, setFormData] = useState({
    date: appointment.date,
    heure: appointment.heure,
    type: appointment.type,
    medecin_id: appointment.medecin_id, // 🔹 Incluimos medecin_id en el estado
  });

  const [medecins, setMedecins] = useState<MedecinType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ✅ Obtener la lista de médicos al abrir el modal
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

  // ✅ Manejar cambios en los inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Guardar cambios en la API
  const handleSave = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await api.put(`/rendezvous/${appointment._id}`, formData);
      console.log("✅ Rendez-vous mis à jour avec succès:", formData);

      // ✅ Actualizar el estado en `DashboardPatient.tsx`
      onUpdate({ ...appointment, ...formData });

      // ✅ Cerrar el modal
      onClose();
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour :", error);
      setErrorMessage("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">
          Modifier le Rendez-vous
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Heure</label>
          <input
            type="time"
            name="heure"
            value={formData.heure}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* 🔹 Dropdown para seleccionar el médico */}
        <div className="mb-4">
          <label className="block text-gray-700">Médecin</label>
          <select
            name="medecin_id"
            value={formData.medecin_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {medecins.map((medecin) => (
              <option key={medecin.user_id} value={medecin.user_id}>
                {medecin.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Consultation générale">Consultation Générale</option>
            <option value="Examen de routine">Examen de Routine</option>
            <option value="Urgence">Urgence</option>
          </select>
        </div>

        {/* 🔹 Nuevo campo para editar le statut */}
        {canEditStatut && (
          <div className="mb-4">
            <label className="block text-gray-700">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRendezVousModal;
