import { useNavigate } from "react-router-dom";
import { getAdminSession } from "../services/auth";
import { useEffect } from "react";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const admin = getAdminSession();
    if (!admin) {
      navigate("/admin-login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Tableau de Bord Administrateur
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/admin/medecins")}
            className="bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition text-lg"
          >
            👨‍⚕️ Gérer les Médecins
          </button>

          <button
            onClick={() => navigate("/admin/patients")}
            className="bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition text-lg"
          >
            👩‍🦰 Gérer les Patients
          </button>

          <button
            onClick={() => navigate("/admin/rendezvous")}
            className="bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition text-lg"
          >
            📅 Gérer les Rendez-vous
          </button>

          <button
            onClick={() => navigate("/admin/visites")}
            className="bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition text-lg"
          >
            📋 Historique des Visites
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
