import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCommentDots,
  FaFileMedical,
  FaUserCircle, // 🔹 Nuevo icono para Profil
} from "react-icons/fa";
import "../styles/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="dashboard-nav">
      <button
        className={`nav-item ${
          location.pathname === "/dashboard-patient" ? "active" : ""
        }`}
        onClick={() => navigate("/dashboard-patient")}
      >
        <FaCalendarAlt size={18} /> Rendez-vous
      </button>
      <button
        className={`nav-item ${
          location.pathname === "/chatbox" ? "active" : ""
        }`}
        onClick={() => navigate("/chatbox")}
      >
        <FaCommentDots size={18} /> Chatbox
      </button>
      <button
        className={`nav-item ${
          location.pathname === "/dossier-medical" ? "active" : ""
        }`}
        onClick={() => navigate("/dossier-medical")}
      >
        <FaFileMedical size={18} /> Dossier Médical
      </button>
      <button
        className={`nav-item ${
          location.pathname === "/profil" ? "active" : "" // 🔹 Nueva ruta
        }`}
        onClick={() => navigate("/profil")}
      >
        <FaUserCircle size={18} /> Profil
      </button>
    </nav>
  );
};

export default Sidebar;
