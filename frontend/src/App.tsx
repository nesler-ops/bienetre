import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import RegistrerPatient from "./pages/RegistrerPatient";
import DashboardPatient from "./pages/DashboardPatient";
import DashboardMedecin from "./pages/DashboardMedecin";
import CreateRendezvous from "./pages/CreateRendezVous";
import AdminLogin from "./pages/AdminLogin";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ChatboxPage from "./pages/Chatbox";
import Profil from "./pages/Profil";
import HistoriqueRendezVous from "./pages/HistoriqueRendezVous";
import ProfilMedecin from "./pages/ProfilMedecin";
import AjouterVisite from "./pages/AjouterVisite";
import AdminMedecins from "./pages/AdminMedecins";
import AdminPatients from "./pages/AdminPatients";
import Sommeil from "./pages/Sommeil";
import Nutrition from "./pages/Nutrition";
import Exercice from "./pages/Exercice";
import Hydratation from "./pages/Hydratation";
import Prevention from "./pages/Prevention";
//import Mental from "./pages/Mental";
import TwoFAVerification from "./pages/TwoFAVerification";
import DisponibilitesMedecin from "./pages/DisponibilitesMedecin";
import AssistantIA from "./pages/AssistantIA";
import DossierMedical from "./pages/DossierMedical";
import DossierMedicalMedecin from "./pages/DossierMedicalMedecin";

import "./styles/global.css";
import "./styles/dashboard.css";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-patient" element={<RegistrerPatient />} />
          <Route path="/profil-medecin" element={<ProfilMedecin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/admin/medecins" element={<AdminMedecins />} />
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/verify-code" element={<TwoFAVerification />} />
          <Route
            path="/disponibilites-medecin"
            element={<DisponibilitesMedecin />}
          />

          <Route path="/assistant-ia" element={<AssistantIA />} />
          <Route path="/dossier-medical" element={<DossierMedical />} />
          <Route
            path="/dossier-medical-medecin"
            element={<DossierMedicalMedecin />}
          />

          {/* Bien-être */}
          <Route path="/sommeil" element={<Sommeil />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/exercice" element={<Exercice />} />
          <Route path="/hydratation" element={<Hydratation />} />
          <Route path="/prevention" element={<Prevention />} />
          {/*<Route path="/mental" element={<Mental />} /> */}
          {/* Dashboards protegidos */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminProtectedRoute>
                <DashboardAdmin />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/dashboard-patient"
            element={
              <ProtectedRoute>
                <DashboardPatient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-medecin"
            element={
              <ProtectedRoute>
                <DashboardMedecin />
              </ProtectedRoute>
            }
          />
          {/* Funcionalidades protegidas */}
          <Route
            path="/create-rendezvous"
            element={
              <ProtectedRoute>
                <CreateRendezvous />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbox"
            element={
              <ProtectedRoute>
                <ChatboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historique-rendezvous"
            element={
              <ProtectedRoute>
                <HistoriqueRendezVous />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajouter-visite/:rendezvous_id"
            element={
              <ProtectedRoute>
                <AjouterVisite />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
