import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";
import Sidebar from "../components/SidebarMedecin";
import { captureImage } from "../services/faceAuth";

interface MedecinData {
  nom: string;
  prenom: string;
  specialite: string;
  matricule: string;
  date_naissance: string;
  genre: string;
}

interface AdresseData {
  adresse: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface ContactData {
  telephone: string;
  email: string;
}

interface UserData {
  username: string;
  password?: string;
  confirmPassword?: string;
}

const ProfilMedecin = () => {
  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null);
  const [useFaceRecognition, setUseFaceRecognition] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);

  const [medecin, setMedecin] = useState<MedecinData | null>(null);
  const [adresse, setAdresse] = useState<AdresseData | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const session = getUserSession();

  useEffect(() => {
    if (!session?.user_id) {
      setError("Utilisateur non authentifié.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get(`/medecins/profil/${session.user_id}`);
        const { medecin, adresse, contact, user } = response.data;

        setMedecin(medecin);
        setAdresse(adresse);
        setContact(contact);
        setUser(user);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du profil :", err);
        setError("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Profil du Médecin</h2>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Informations personnelles
            </h3>
            <p>
              <strong>Nom:</strong> {medecin?.nom}
            </p>
            <p>
              <strong>Prénom:</strong> {medecin?.prenom}
            </p>
            <p>
              <strong>Spécialité:</strong> {medecin?.specialite}
            </p>
            <p>
              <strong>Genre:</strong> {medecin?.genre}
            </p>
            <p>
              <strong>Date de naissance:</strong> {medecin?.date_naissance}
            </p>
            <p>
              <strong>Matricule:</strong> {medecin?.matricule}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Adresse</h3>
            <p>
              <strong>Adresse:</strong> {adresse?.adresse}
            </p>
            <p>
              <strong>Rue:</strong> {adresse?.rue}
            </p>
            <p>
              <strong>Ville:</strong> {adresse?.ville}
            </p>
            <p>
              <strong>Code Postal:</strong> {adresse?.code_postal}
            </p>
            <p>
              <strong>Pays:</strong> {adresse?.pays}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Contact</h3>
            <p>
              <strong>Téléphone:</strong> {contact?.telephone}
            </p>
            <p>
              <strong>Email:</strong> {contact?.email}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Compte</h3>
            <p>
              <strong>Nom d'utilisateur:</strong> {user?.username}
            </p>
          </div>

          <div className="text-right mt-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={openModal}
            >
              Modifier le profil
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold mb-4">Modifier le Profil</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (!session?.user_id) {
                      alert("Session invalide.");
                      return;
                    }

                    // 🔹 Validación des mots de passe
                    if (user?.password && user?.confirmPassword) {
                      if (user.password !== user.confirmPassword) {
                        alert("❌ Les mots de passe ne correspondent pas.");
                        return;
                      }
                    }

                    // 🔹 Construire l'objet final à envoyer
                    const updatedData = {
                      user: {
                        username: user?.username,
                        password: user?.password,
                        face_encoding: useFaceRecognition ? faceEncoding : null,
                      },
                      medecin: {
                        nom: medecin?.nom,
                        prenom: medecin?.prenom,
                        genre: medecin?.genre,
                        date_naissance: medecin?.date_naissance,
                        specialite: medecin?.specialite,
                      },
                      adresse: {
                        adresse: adresse?.adresse,
                        rue: adresse?.rue,
                        ville: adresse?.ville,
                        code_postal: adresse?.code_postal,
                        pays: adresse?.pays,
                      },
                      contact: {
                        telephone: contact?.telephone,
                        email: contact?.email,
                      },
                    };

                    // 🔹 Envoi au backend via un seul endpoint
                    await api.put(
                      `/medecins/profil/${session.user_id}`,
                      updatedData
                    );

                    alert("✅ Profil mis à jour avec succès !");
                    closeModal();
                  } catch (error) {
                    console.error("❌ Erreur lors de la mise à jour :", error);
                    alert("Une erreur s'est produite lors de la mise à jour.");
                  }
                }}
              >
                <h4 className="font-semibold mb-2">Nom d'utilisateur</h4>
                <input
                  type="text"
                  value={user?.username || ""}
                  onChange={(e) =>
                    setUser((prev: any) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />

                <h4 className="font-semibold mb-2">Mot de passe</h4>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  onChange={(e) =>
                    setUser((prev: any) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  onChange={(e) =>
                    setUser((prev: any) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <h4 className="font-semibold mb-2">Contact</h4>
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={contact?.telephone || ""}
                  onChange={(e) =>
                    setContact((prev: any) => ({
                      ...prev,
                      telephone: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contact?.email || ""}
                  onChange={(e) =>
                    setContact((prev: any) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <h4 className="font-semibold mb-2">Adresse</h4>
                <input
                  type="text"
                  placeholder="Adresse"
                  value={adresse?.adresse || ""}
                  onChange={(e) =>
                    setAdresse((prev: any) => ({
                      ...prev,
                      adresse: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Rue"
                  value={adresse?.rue || ""}
                  onChange={(e) =>
                    setAdresse((prev: any) => ({
                      ...prev,
                      rue: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={adresse?.ville || ""}
                  onChange={(e) =>
                    setAdresse((prev: any) => ({
                      ...prev,
                      ville: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Code Postal"
                  value={adresse?.code_postal || ""}
                  onChange={(e) =>
                    setAdresse((prev: any) => ({
                      ...prev,
                      code_postal: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Pays"
                  value={adresse?.pays || ""}
                  onChange={(e) =>
                    setAdresse((prev: any) => ({
                      ...prev,
                      pays: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded mb-4"
                />

                <h4 className="font-semibold mt-4">Reconnaissance Faciale</h4>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={useFaceRecognition}
                    onChange={(e) => setUseFaceRecognition(e.target.checked)}
                  />
                  Activer la reconnaissance faciale
                </label>

                {useFaceRecognition && (
                  <button
                    type="button"
                    onClick={captureFaceData}
                    className="mt-2 w-full bg-green-500 text-white p-2 rounded"
                    disabled={captureLoading}
                  >
                    {captureLoading
                      ? "Capture en cours..."
                      : "Capturer les données faciales"}
                  </button>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilMedecin;
