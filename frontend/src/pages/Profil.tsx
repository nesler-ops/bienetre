import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";

const Profil = () => {
  const [userData, setUserData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({
    patient: {
      nom: "",
      prenom: "",
      numero_assurance: "",
      date_naissance: "",
      genre: "",
    },
    adresse: {
      adresse: "",
      rue: "",
      ville: "",
      code_postal: "",
      pays: "",
    },
    contact: {
      telephone: "",
      email: "",
    },
  });

  const userSession = getUserSession();

  useEffect(() => {
    if (!userSession?.user_id) {
      setError("Utilisateur non authentifié.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get(`/patients/${userSession.user_id}`);
        console.log("✅ Données du profil:", response.data);

        setUserData(response.data || {});

        setEditData({
          patient: response.data.patient || {
            nom: "",
            prenom: "",
            numero_assurance: "",
            date_naissance: "",
            genre: "",
          },
          adresse: response.data.adresse || {
            adresse: "",
            rue: "",
            ville: "",
            code_postal: "",
            pays: "",
          },
          contact: response.data.contact || {
            telephone: "",
            email: "",
          },
        });
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des données:", error);
        setError("Impossible de récupérer les informations du profil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userSession?.user_id]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (editData.patient.hasOwnProperty(name)) {
      setEditData((prev: any) => ({
        ...prev,
        patient: { ...prev.patient, [name]: value },
      }));
    } else if (editData.adresse.hasOwnProperty(name)) {
      setEditData((prev: any) => ({
        ...prev,
        adresse: { ...prev.adresse, [name]: value },
      }));
    } else if (editData.contact.hasOwnProperty(name)) {
      setEditData((prev: any) => ({
        ...prev,
        contact: { ...prev.contact, [name]: value },
      }));
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Profil du Patient</h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Informations Personnelles
          </h3>
          <p>
            <strong>Nom:</strong> {userData?.patient?.nom}
          </p>
          <p>
            <strong>Prénom:</strong> {userData?.patient?.prenom}
          </p>
          <p>
            <strong>Numéro d'Assurance:</strong>{" "}
            {userData?.patient?.numero_assurance}
          </p>
          <p>
            <strong>Date de Naissance:</strong>{" "}
            {userData?.patient?.date_naissance}
          </p>
          <p>
            <strong>Genre:</strong> {userData?.patient?.genre}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-4">Adresse</h3>
          <p>
            <strong>Adresse:</strong> {userData?.adresse?.adresse}
          </p>
          <p>
            <strong>Rue:</strong> {userData?.adresse?.rue}
          </p>
          <p>
            <strong>Ville:</strong> {userData?.adresse?.ville}
          </p>
          <p>
            <strong>Code Postal:</strong> {userData?.adresse?.code_postal}
          </p>
          <p>
            <strong>Pays:</strong> {userData?.adresse?.pays}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-4">Contact</h3>
          <p>
            <strong>Téléphone:</strong> {userData?.contact?.telephone}
          </p>
          <p>
            <strong>Email:</strong> {userData?.contact?.email}
          </p>

          <button
            onClick={openModal}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Modifier le Profil
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold mb-4">Modifier le Profil</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    console.log("📌 Enviando datos actualizados:", editData);
                    await api.put(
                      `/patients/${userSession?.user_id}`,
                      editData
                    );
                    alert("✅ Profil mis à jour avec succès !");
                    closeModal();
                    window.location.reload();
                  } catch (error) {
                    console.error(
                      "❌ Erreur lors de la mise à jour du profil:",
                      error
                    );
                    setError("Impossible de mettre à jour le profil.");
                  }
                }}
              >
                <h4 className="text-md font-semibold mb-2">
                  Informations Personnelles
                </h4>
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom"
                  value={editData.patient.nom}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom"
                  value={editData.patient.prenom}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="numero_assurance"
                  placeholder="Numéro d'assurance"
                  value={editData.patient.numero_assurance}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="date"
                  name="date_naissance"
                  value={editData.patient.date_naissance}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <select
                  name="genre"
                  value={editData.patient.genre}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                >
                  <option value="">Sélectionnez le genre</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                </select>

                <h4 className="text-md font-semibold mb-2 mt-4">Adresse</h4>
                <input
                  type="text"
                  name="adresse"
                  placeholder="Adresse"
                  value={editData.adresse.adresse}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="rue"
                  placeholder="Rue"
                  value={editData.adresse.rue}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="ville"
                  placeholder="Ville"
                  value={editData.adresse.ville}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="code_postal"
                  placeholder="Code Postal"
                  value={editData.adresse.code_postal}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="pays"
                  placeholder="Pays"
                  value={editData.adresse.pays}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />

                <h4 className="text-md font-semibold mb-2 mt-4">Contact</h4>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="Téléphone"
                  value={editData.contact.telephone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={editData.contact.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mb-2"
                />

                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    Sauvegarder
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

export default Profil;
