import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserSession, removeUserSession } from "../services/auth";
import "../styles/dashboardMedecin.css";
import EditRendezVousModal from "../components/EditRendezVousModal";

interface RendezvousType {
  _id: string;
  date: string;
  heure: string;
  type: string;
  patient_id: string;
  statut?: string;
  nom?: string;
  prenom?: string;
  visite_faite?: boolean;
}

const DashboardMedecin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    username: string;
    user_type: string;
    user_id: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<RendezvousType | null>(null);

  const getTodayString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // → "2025-04-08"
  };

  const [appointments, setAppointments] = useState<RendezvousType[]>([]);
  const [filtered, setFiltered] = useState<RendezvousType[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    heure: "",
    statut: "",
    date: getTodayString(),
  });

  useEffect(() => {
    const sessionUser = getUserSession();
    if (!sessionUser || sessionUser.user_type !== "Médecin") {
      navigate("/");
    } else {
      setUser(sessionUser);
      fetchAppointments(sessionUser.user_id);
    }
  }, [navigate]);

  const fetchAppointments = async (userId: string) => {
    try {
      const response = await api.get(`/rendezvous/${userId}`);
      const allAppointments = response.data;

      const withPatientNames = await Promise.all(
        allAppointments.map(async (rdv: RendezvousType) => {
          try {
            const res = await api.get(`/patients/${rdv.patient_id}`);
            return {
              ...rdv,
              nom: res.data?.patient?.nom || "",
              prenom: res.data?.patient?.prenom || "",
            };
          } catch {
            return { ...rdv, nom: "", prenom: "" };
          }
        })
      );

      setAppointments(withPatientNames);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des rendez-vous :",
        error
      );
    }
  };

  useEffect(() => {
    console.log("🧪 filters.date:", filters.date);
    console.log("📆 Exemple date rendez-vous:", appointments[0]?.date);
    const search = filters.search.toLowerCase();
    const filteredData = appointments.filter((rdv) => {
      const matchesName =
        rdv.nom?.toLowerCase().includes(search) ||
        rdv.prenom?.toLowerCase().includes(search);
      const matchesType = filters.type ? rdv.type === filters.type : true;
      const matchesHeure = filters.heure ? rdv.heure === filters.heure : true;
      const matchesStatut = filters.statut
        ? rdv.statut === filters.statut
        : true;
      const matchesDate = filters.date ? rdv.date === filters.date : true;

      return (
        matchesName &&
        matchesType &&
        matchesHeure &&
        matchesStatut &&
        matchesDate
      );
    });
    setFiltered(filteredData);
  }, [filters, appointments]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    removeUserSession();
    navigate("/");
  };

  const handleResetFilters = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFilters({
      search: "",
      type: "",
      heure: "",
      statut: "",
      date: today,
    });

    const todayAppointments = appointments.filter((rdv) => rdv.date === today);
    setFiltered(todayAppointments);
  };

  return (
    <div className="dashboard-container">
      <div className="flex flex-col items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mt-10">
          <h2 className="text-3xl font-bold text-center text-gray-700">
            Agenda du Médecin
          </h2>

          <button
            onClick={() => navigate("/historique-rendezvous")}
            className="mb-4 text-blue-600 hover:underline text-sm"
          >
            Voir l'historique des rendez-vous
          </button>

          <p className="text-center text-gray-500 mb-4">
            Bienvenue, {user?.username}
          </p>

          {/* 🔍 Filtros de búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              name="search"
              placeholder="Rechercher par nom ou prénom"
              value={filters.search}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            <input
              type="time"
              name="heure"
              value={filters.heure}
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
              <option value="Consultation générale">
                Consultation générale
              </option>
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
            {/* 📅 Calendario de fecha */}
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </div>

          <div className="flex justify-end mb-4">
            <button
              onClick={handleResetFilters}
              className="bg-gray-200 text-sm text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Réinitialiser les filtres
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 col-span-2">
                Aucun rendez-vous trouvé.
              </p>
            ) : (
              filtered.map((appointment) => (
                <div
                  key={appointment._id}
                  className="appointment-card flex flex-col gap-2"
                >
                  <div>
                    <p className="text-gray-700 font-semibold">
                      {appointment.date} - {appointment.heure}
                    </p>
                    <p className="text-gray-500">{appointment.type}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Statut:</strong> {appointment.statut}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Patient:</strong> {appointment.prenom}{" "}
                      {appointment.nom}
                    </p>
                  </div>

                  <div className="actions mt-2 flex gap-2 flex-wrap">
                    {appointment.visite_faite ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        ✅ Visite déjà faite
                      </span>
                    ) : appointment.statut !== "Annulé" ? (
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() =>
                          navigate(`/ajouter-visite/${appointment._id}`)
                        }
                      >
                        Ajouter Visite
                      </button>
                    ) : null}

                    {!appointment.visite_faite &&
                      appointment.statut !== "Annulé" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setIsModalOpen(true);
                            }}
                            className="btn-yellow"
                          >
                            Modifier
                          </button>

                          <button
                            className="btn-red"
                            onClick={async () => {
                              try {
                                await api.put(
                                  `/rendezvous/${appointment._id}`,
                                  {
                                    statut: "Annulé",
                                  }
                                );
                                setAppointments((prev) =>
                                  prev.map((item) =>
                                    item._id === appointment._id
                                      ? { ...item, statut: "Annulé" }
                                      : item
                                  )
                                );
                              } catch (error) {
                                console.error(
                                  "❌ Erreur lors de l'annulation :",
                                  error
                                );
                              }
                            }}
                          >
                            Annuler
                          </button>
                        </>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition mt-6"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* 🔹 Modal de modification */}
      {isModalOpen && selectedAppointment && (
        <EditRendezVousModal
          appointment={selectedAppointment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onUpdate={(updated) => {
            setAppointments((prev) =>
              prev.map((a) =>
                a._id === updated._id ? { ...a, ...updated } : a
              )
            );
          }}
          canEditStatut={true}
        />
      )}
    </div>
  );
};

export default DashboardMedecin;
