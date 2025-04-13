import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { captureImage } from "../services/faceAuth";
import { UserType } from "../types";

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const progressPercentage =
    step > 1 ? ((step - 1) / (totalSteps - 1)) * 100 : 0;

  const [useFaceRecognition, setUseFaceRecognition] = useState(false);
  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserType>({
    username: "",
    password: "",
    confirmPassword: "",
    user_type: "Patient",
  });

  const [patientData, setPatientData] = useState({
    nom: "",
    prenom: "",
    numero_assurance: "",
    date_naissance: "",
    genre: "",
  });

  const [addressData, setAddressData] = useState({
    adresse: "",
    rue: "",
    ville: "",
    code_postal: "",
    pays: "",
  });

  const [contactData, setContactData] = useState({
    telephone: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  // ✅ Manejo de pasos del formulario
  const handleNextStep = () => {
    setError(null);
    if (step === 1 && formData.username.trim() === "") {
      setError("Veuillez entrer un nom d'utilisateur.");
      return;
    }
    if (step === 2) {
      if (
        formData.password.trim() === "" ||
        formData.confirmPassword.trim() === ""
      ) {
        setError("Veuillez entrer et confirmer le mot de passe.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const captureFaceData = async () => {
    setError(null);
    setCaptureLoading(true);
    try {
      const imageBlob = await captureImage();
      if (!imageBlob) {
        setError("Impossible de capturer l'image.");
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face.jpg");

      const response = await api.post("facial/encode", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.face_encoding) {
        setFaceEncoding(response.data.face_encoding);
        alert("✅ Données faciales capturées avec succès.");
      } else {
        setError("Aucun visage détecté. Veuillez réessayer.");
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la capture faciale:", error);
      setError(
        `Erreur lors de la capture des données faciales: ${
          error.response?.data?.detail || error.message || "Erreur inconnue"
        }`
      );
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("📌 Enviando datos de usuario:", formData);

      // ✅ Registrar usuario en UserPatients
      const userResponse = await api.post("userpatients", {
        username: formData.username,
        password: formData.password,
        user_type: "Patient",
        face_encoding: useFaceRecognition && faceEncoding ? faceEncoding : null,
      });

      console.log("✅ Usuario registrado:", userResponse.data);

      const userId = userResponse.data.user_id;
      if (!userId) {
        throw new Error("user_id no recibido en la respuesta del servidor");
      }

      // ✅ Datos completos del paciente, incluyendo dirección y contacto
      const finalPatientData = {
        user_id: userId,
        nom: patientData.nom,
        prenom: patientData.prenom,
        numero_assurance: patientData.numero_assurance,
        date_naissance: patientData.date_naissance,
        genre: patientData.genre,
        date_creation: new Date().toISOString(),

        // 🔹 Agregar los datos de dirección
        adresse: addressData.adresse,
        rue: addressData.rue,
        ville: addressData.ville,
        code_postal: addressData.code_postal,
        pays: addressData.pays,

        // 🔹 Agregar los datos de contacto
        telephone: contactData.telephone,
        email: contactData.email,
      };

      console.log("📌 Enviando datos del paciente:", finalPatientData);

      // ✅ Registrar paciente con todos los datos
      await api.post("patients", finalPatientData);

      alert("Patient enregistré avec succès !");
      navigate("/");
    } catch (error: any) {
      console.error("❌ Erreur lors de l'inscription:", error);
      setError(
        `Erreur lors de l'inscription: ${
          error.response?.data?.detail || error.message || "Erreur inconnue"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {/* 🔹 Barra de progreso animada */}
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${progressPercentage}%`,
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">
          Inscription du Patient
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 🔹 Paso 1: Captura de Nombre de Usuario */}
          {step === 1 && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <button
                onClick={handleNextStep}
                type="button"
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                Suivant
              </button>
            </>
          )}

          {/* 🔹 Paso 2: Captura de Contraseña */}
          {step === 2 && (
            <>
              <input
                type="password"
                name="password"
                placeholder="Mot de passe (min. 8 caractères)"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-4"
                minLength={8}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-4"
                minLength={8}
                required
              />
              {formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mb-4">
                    ⚠️ Les mots de passe ne correspondent pas !
                  </p>
                )}
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousStep}
                  type="button"
                  className="w-1/2 bg-gray-400 text-white p-2 rounded"
                >
                  Retour
                </button>
                <button
                  onClick={handleNextStep}
                  type="button"
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  disabled={
                    formData.password.length < 8 ||
                    formData.password !== formData.confirmPassword
                  }
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {/* 🔹 Paso 3: Información del Paciente */}
          {step === 3 && (
            <>
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={patientData.nom}
                onChange={handlePatientChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={patientData.prenom}
                onChange={handlePatientChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="numero_assurance"
                placeholder="Numéro d'assurance"
                value={patientData.numero_assurance}
                onChange={handlePatientChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="date"
                name="date_naissance"
                value={patientData.date_naissance}
                onChange={handlePatientChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              {/* 🔹 Validación: Fecha de nacimiento mínima de 5 años */}
              {patientData.date_naissance &&
                new Date().getFullYear() -
                  new Date(patientData.date_naissance).getFullYear() <
                  5 && (
                  <p className="text-red-500 text-sm mb-4">
                    ⚠️ La date de naissance doit être réaliste (minimum 5 ans).
                  </p>
                )}

              <select
                name="genre"
                value={patientData.genre}
                onChange={handlePatientChange}
                className="w-full p-2 border rounded mb-4"
                required
              >
                <option value="">Sélectionnez le genre</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousStep}
                  type="button"
                  className="w-1/2 bg-gray-400 text-white p-2 rounded"
                >
                  Retour
                </button>
                <button
                  onClick={handleNextStep}
                  type="button"
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  disabled={
                    patientData.date_naissance
                      ? new Date().getFullYear() -
                          new Date(patientData.date_naissance).getFullYear() <
                        5
                      : false
                  }
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {/* 🔹 Paso 4: Dirección */}
          {step === 4 && (
            <>
              {error && step === 4 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <input
                type="text"
                name="adresse"
                placeholder="Adresse"
                value={addressData.adresse}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="rue"
                placeholder="Rue"
                value={addressData.rue}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="ville"
                placeholder="Ville"
                value={addressData.ville}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="code_postal"
                placeholder="Code Postal"
                value={addressData.code_postal}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="text"
                name="pays"
                placeholder="Pays"
                value={addressData.pays}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded mb-4"
                required
              />

              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousStep}
                  type="button"
                  className="w-1/2 bg-gray-400 text-white p-2 rounded"
                >
                  Retour
                </button>
                <button
                  onClick={handleNextStep}
                  type="button"
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  disabled={
                    !addressData.adresse ||
                    !addressData.rue ||
                    !addressData.ville ||
                    !addressData.code_postal ||
                    !addressData.pays
                  }
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {/* 🔹 Paso 5: Contacto */}
          {step === 5 && (
            <>
              {error && step === 5 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone"
                value={contactData.telephone}
                onChange={handleContactChange}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={contactData.email}
                onChange={handleContactChange}
                className="w-full p-2 border rounded mb-4"
                required
              />

              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousStep}
                  type="button"
                  className="w-1/2 bg-gray-400 text-white p-2 rounded"
                >
                  Retour
                </button>
                <button
                  onClick={handleNextStep}
                  type="button"
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  disabled={!contactData.telephone || !contactData.email}
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <label className="block text-gray-700 font-medium mb-2">
                <input
                  type="checkbox"
                  checked={useFaceRecognition}
                  onChange={(e) => setUseFaceRecognition(e.target.checked)}
                  className="mr-2"
                />
                Voulez-vous utiliser la reconnaissance faciale ?
              </label>

              {useFaceRecognition && (
                <button
                  onClick={captureFaceData}
                  type="button"
                  className="w-full bg-green-500 text-white p-2 rounded mt-2"
                  disabled={captureLoading}
                >
                  {captureLoading
                    ? "Capture en cours..."
                    : "Capturer les données faciales"}
                </button>
              )}

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handlePreviousStep}
                  type="button"
                  className="w-1/2 bg-gray-400 text-white p-2 rounded"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-500 text-white p-2 rounded"
                  disabled={loading || (useFaceRecognition && !faceEncoding)}
                >
                  {loading ? "Enregistrement..." : "S'inscrire"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
