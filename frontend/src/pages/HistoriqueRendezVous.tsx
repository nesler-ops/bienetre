import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";
import Sidebar from "../components/SidebarMedecin";

interface RendezvousType {
  _id: string;
  date: string;
  heure: string;
  type: string;
  statut: string;
  patient_id: string;
  nom?: string;
  prenom?: string;
}

const HistoriqueRendezVous = () => {
  const [appointments, setAppointments] = useState<RendezvousType[]>([]);
  const [filtered, setFiltered] = useState<RendezvousType[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    type: "",
    statut: "",
  });

  const user = getUserSession();

  useEffect(() => {
    if (!user || user.user_type !== "Médecin") return;

    const fetchAppointments = async () => {
      try {
        const response = await api.get(`/rendezvous/${user.user_id}`);
        const data: RendezvousType[] = response.data;

        // Obtener nombres de pacientes
        const rendezvousWithNames = await Promise.all(
          data.map(async (rdv) => {
            try {
              const patientRes = await api.get(`/patients/${rdv.patient_id}`);
              return {
                ...rdv,
                nom: patientRes.data?.patient?.nom || "",
                prenom: patientRes.data?.patient?.prenom || "",
              };
            } catch {
              return { ...rdv, nom: "", prenom: "" };
            }
          })
        );

        setAppointments(rendezvousWithNames);
        setFiltered(rendezvousWithNames);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const filteredResults = appointments.filter((rdv) => {
      const searchText = filters.search.toLowerCase();
      const matchesSearch =
        rdv.nom?.toLowerCase().includes(searchText) ||
        rdv.prenom?.toLowerCase().includes(searchText);

      const matchesDate = filters.date ? rdv.date === filters.date : true;
      const matchesType = filters.type ? rdv.type === filters.type : true;
      const matchesStatut = filters.statut
        ? rdv.statut === filters.statut
        : true;

      return matchesSearch && matchesDate && matchesType && matchesStatut;
    });

    setFiltered(filteredResults);
  }, [filters, appointments]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Historique des Rendez-vous</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            name="search"
            placeholder="Rechercher par nom ou prénom"
            value={filters.search}
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
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Tous les types</option>
            <option value="Consultation générale">Consultation générale</option>
            <option value="Examen de routine">Examen de routine</option>
            <option value="Urgence">Urgence</option>
          </select>
          <select
            name="statut"
            value={filters.statut}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Confirmé">Confirmé</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center">Aucun rendez-vous trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((rdv) => (
              <div
                key={rdv._id}
                className="bg-white p-4 rounded-lg shadow border"
              >
                <h3 className="font-semibold text-lg">
                  {rdv.date} - {rdv.heure}
                </h3>
                <p className="text-sm text-gray-600">{rdv.type}</p>
                <p className="text-sm">
                  <strong>Patient:</strong> {rdv.prenom} {rdv.nom}
                </p>
                <p className="text-sm">
                  <strong>Statut:</strong> {rdv.statut}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueRendezVous;
