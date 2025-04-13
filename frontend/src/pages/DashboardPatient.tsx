import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getUserSession } from "../services/auth";
import EditRendezVousModal from "../components/EditRendezVousModal";
import "../styles/dashboard.css";

interface RendezvousType {
  _id: string;
  date: string;
  heure: string;
  type: string;
  statut: string;
}

const DashboardPatient = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    username: string;
    user_type: string;
    user_id: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<RendezvousType[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<RendezvousType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const sessionUser = getUserSession();
    if (!sessionUser || sessionUser.user_type !== "Patient") {
      navigate("/");
    } else {
      setUser(sessionUser);
      fetchAppointments(sessionUser.user_id);
    }
  }, [navigate]);

  const fetchAppointments = async (userId: string) => {
    try {
      const response = await api.get<RendezvousType[]>(`/rendezvous/${userId}`);
      setAppointments(response.data);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des rendez-vous :",
        error
      );
    }
  };

  const handleEdit = (appointment: RendezvousType) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleUpdate = (updatedAppointment: RendezvousType) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment._id === updatedAppointment._id
          ? updatedAppointment
          : appointment
      )
    );
    handleClose();
  };

  return (
    <div className="dashboard-container">
      {/* 🆕 Contenido del Dashboard */}
      <div className="dashboard-content">
        <h2 className="dashboard-title">Mes Rendez-vous Médicaux</h2>
        <p className="dashboard-subtitle">Bienvenue, {user?.username}</p>

        <button
          onClick={() => navigate("/create-rendezvous")}
          className="btn-green"
        >
          Prendre un Nouveau Rendez-vous
        </button>

        <div className="appointment-list">
          {appointments.length === 0 ? (
            <p className="empty-message">
              Vous n'avez aucun rendez-vous programmé.
            </p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <h3>
                  {appointment.date} - {appointment.heure}
                </h3>
                <p>{appointment.type}</p>
                <p>{appointment.statut}</p>
                <div className="actions">
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="btn-yellow"
                    disabled={appointment.statut === "Annulé"}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/rendezvous/${appointment._id}`, {
                          statut: "Annulé",
                        });
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
                    className="btn-red"
                    disabled={appointment.statut === "Annulé"}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && selectedAppointment && (
          <EditRendezVousModal
            appointment={selectedAppointment}
            onClose={handleClose}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPatient;
