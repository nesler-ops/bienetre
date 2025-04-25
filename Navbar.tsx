import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getUserSession,
  removeUserSession,
  getAdminSession,
  logoutAdmin,
} from "../services/auth";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaCommentDots,
  FaFileMedical,
  FaUserCircle,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = /^\/(login|register|admin-login)/.test(location.pathname);

  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    city: string;
  } | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setUser(getUserSession());
    setAdmin(getAdminSession());
  }, [location.pathname]);

  const handleLogout = () => {
    if (admin) {
      logoutAdmin();
      setAdmin(null);
      navigate("/admin-login");
    } else {
      removeUserSession();
      setUser(null);
      navigate("/");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchWeatherAndTime = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${
            import.meta.env.VITE_WEATHER_API_KEY
          }&lang=fr`
        );
        const data = await response.json();

        const temp = data.main.temp;
        const description = data.weather[0].description;
        const city = data.name;
        const timezoneOffset = data.timezone;

        setWeather({ temp, description, city });

        const updateTime = () => {
          const nowUTC = new Date();
          const utcTime = nowUTC.getTime() + nowUTC.getTimezoneOffset() * 60000;
          const localTime = new Date(utcTime + timezoneOffset * 1000);

          setTime(
            localTime.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        };

        updateTime();
        interval = setInterval(updateTime, 60000);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du climat ou de l'heure:",
          error
        );
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndTime(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        () => {
          fetchWeatherAndTime(45.5017, -73.5673);
        }
      );
    } else {
      fetchWeatherAndTime(45.5017, -73.5673);
    }

    return () => clearInterval(interval);
  }, []);

  const renderUserMenu = () => {
    if (admin) {
      return (
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard-admin")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaUserCircle /> <span>Dashboard Admin</span>
          </button>
        </div>
      );
    }

    if (user?.user_type === "Médecin") {
      return (
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard-medecin")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaCalendarAlt /> <span>Rendez-vous</span>
          </button>
          <button
            onClick={() => navigate("/assistant-ia")}
            className="flex items-center gap-2 hover:underline"
          >
            🤖 <span>Assistant IA</span>
          </button>

          <button
            onClick={() => navigate("/disponibilites-medecin")}
            className="flex items-center gap-2 hover:underline"
          >
            🕒 <span>Disponibilités</span>
          </button>
          <button
            onClick={() => navigate("/chatbox")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaCommentDots /> <span>Chatbox</span>
          </button>
          <button
            onClick={() => navigate("/dossier-medical-medecin")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaFileMedical /> <span>Dossier Médical</span>
          </button>
          <button
            onClick={() => navigate("/profil-medecin")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaUserCircle /> <span>Profil</span>
          </button>
        </div>
      );
    }

    if (user?.user_type === "Patient") {
      return (
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard-patient")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaCalendarAlt /> <span>Rendez-vous</span>
          </button>
          <button
            onClick={() => navigate("/chatbox")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaCommentDots /> <span>Chatbox</span>
          </button>
          <button
            onClick={() => navigate("/dossier-medical")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaFileMedical /> <span>Dossier Médical</span>
          </button>
          <button
            onClick={() => navigate("/profil")}
            className="flex items-center gap-2 hover:underline"
          >
            <FaUserCircle /> <span>Profil</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <nav className="bg-blue-600 text-white p-4 fixed top-0 left-0 w-full shadow-md z-50 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img
          src="/BE.png"
          alt="Logo"
          className="h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* 🔹 Clima, ciudad y hora - Ahora siempre visible a la izquierda */}
        {weather && (
          <div className="hidden md:flex text-sm text-white items-center gap-2">
            <span>
              🌡 {weather.temp.toFixed(1)}°C – {weather.description} à{" "}
              {weather.city}
            </span>
            <span className="text-yellow-300">| 🕒 {time}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {renderUserMenu()}

        {!user && !admin && (
          <>
            <Link to="/login" className="hover:underline">
              Se connecter
            </Link>
            <Link to="/register-patient" className="hover:underline">
              S'inscrire
            </Link>
          </>
        )}

        {(user || admin) && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Se déconnecter
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
