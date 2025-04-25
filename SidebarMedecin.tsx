import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCommentDots,
  FaFileMedical,
  FaUserCircle,
} from "react-icons/fa";
import "../styles/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="dashboard-nav">
      <button
        className={`nav-item ${
          location.pathname === "/dashboard-medecin" ? "active" : ""
        }`}
        onClick={() => navigate("/dashboard-medecin")}
      >
        <FaCalendarAlt size={18} /> Rendez-vous
      </button>
      <button
        className={`nav-item ${
          location.pathname === "/chatbox" ? "active" : ""
        }`}
        onClick={() => navigate("/chatbox")}
      >
        <FaCommentDots size={18} /> Diagnostic Medical AI
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
          location.pathname === "/profil-medecin" ? "active" : ""
        }`}
        onClick={() => navigate("/profil-medecin")}
      >
        <FaUserCircle size={18} /> Profil
      </button>
    </nav>
  );
};

export default Sidebar;
