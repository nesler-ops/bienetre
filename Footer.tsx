import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react"; // ✅ Icono de engranaje pequeño

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-200 text-gray-700 py-4 mt-10 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        {/* 🔹 Información de la empresa */}
        <p className="text-sm text-center md:text-left">
          © {new Date().getFullYear()} Bien-être+. Tous droits réservés.
        </p>

        {/* 🔹 Enlace a administración con engranaje */}
        <button
          onClick={() => navigate("/admin-login")} // ✅ Redirige al login de admin
          className="flex items-center text-sm hover:text-gray-900 transition"
        >
          <Settings className="h-5 w-5 mr-1" />
          Administration
        </button>
      </div>
    </footer>
  );
};

export default Footer;
