import { useNavigate } from "react-router-dom";
import {
  FaAppleAlt,
  FaRunning,
  FaWater,
  FaBrain,
  FaSyringe,
  FaBed,
} from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gray-100">
      <div className="flex flex-col items-center justify-center flex-grow">
        {/* 🔹 Sección de Prevención y Bien-être */}
        <div className="w-full px-4 py-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Bienvenue à Bien-être
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Nutrition */}
            <div
              onClick={() => navigate("/nutrition")}
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaAppleAlt size={30} className="text-green-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">Nutrition</h3>
              <p className="text-gray-500 text-sm">
                Vitamines, minéraux, fruits et légumes.
              </p>
            </div>

            {/* Exercice */}
            <div
              onClick={() => navigate("/exercice")}
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaRunning size={30} className="text-blue-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">Exercice</h3>
              <p className="text-gray-500 text-sm">
                Activité physique, routines simples.
              </p>
            </div>

            {/* Hydratation */}
            <div
              onClick={() => navigate("/hydratation")}
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaWater size={30} className="text-cyan-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">
                Hydratation
              </h3>
              <p className="text-gray-500 text-sm">
                Conseils pour boire suffisamment d'eau.
              </p>
            </div>

            {/* Sommeil et Repos */}
            <div
              onClick={() => navigate("/sommeil")}
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaBed size={30} className="text-indigo-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">
                Sommeil et Repos
              </h3>
              <p className="text-gray-500 text-sm">
                L'importance du sommeil et des routines de repos.
              </p>
            </div>

            {/* Prévention médicale */}
            <div
              onClick={() => navigate("/prevention")}
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaSyringe size={30} className="text-red-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">
                Prévention
              </h3>
              <p className="text-gray-500 text-sm">
                Vaccins, bilans réguliers.
              </p>
            </div>

            {/* Santé mentale */}
            <div
              onClick={() =>
                window.open("http://localhost:8000/phq9", "_blank")
              }
              className="cursor-pointer bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              <FaBrain size={30} className="text-purple-500 mb-2" />
              <h3 className="font-semibold text-lg text-gray-700">
                Santé mentale
              </h3>
              <p className="text-gray-500 text-sm">
                Relaxation, respiration, bien-être.
              </p>
            </div>
          </div>
        </div>

        {/* 🔹 Bloque con mapa y botones */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center mt-6">
          <h1 className="text-2xl font-bold text-gray-700 mb-6">
            Carte des cliniques Bien-être
          </h1>

          {/* 🗺️ Mapa con ubicación */}
          <div className="mb-4">
            <MapComponent />
          </div>

          <p className="text-gray-500 mb-4">
            Connectez-vous ou inscrivez-vous en tant que patient
          </p>

          {/* Botón de conexión */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md mb-4"
          >
            Se Connecter
          </button>

          {/* Botón de inscripción */}
          <button
            onClick={() => navigate("/register-patient")}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
          >
            S'inscrire en tant que Patient
          </button>
        </div>
      </div>

      {/* 🔹 Footer */}
      <Footer />
    </div>
  );
};

export default Home;
