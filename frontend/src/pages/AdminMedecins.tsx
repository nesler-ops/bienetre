import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAdminSession } from "../services/auth";
import { captureImage } from "../services/faceAuth";

interface MedecinForm {
  nom: string;
  prenom: string;
  specialite: string;
  matricule: string;
  date_naissance: string;
  genre: string;
}

interface AdresseForm {
  adresse: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface ContactForm {
  telephone: string;
  email: string;
}

interface UserForm {
  username: string;
  password?: string;
}

interface MedecinFull {
  _id: string;
  nom: string;
  prenom: string;
  specialite: string;
  matricule: string;
  genre: string;
  date_naissance: string;
  user_id: string;
}

const AdminMedecins = () => {
  const navigate = useNavigate();
  const [medecins, setMedecins] = useState<MedecinFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [useFaceRecognition, setUseFaceRecognition] = useState(false);
  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null);
  const [captureLoading, setCaptureLoading] = useState(false);

  const [medecin, setMedecin] = useState<MedecinForm>({
    nom: "",
    prenom: "",
    specialite: "",
    matricule: "",
    genre: "",
    date_naissance: "",
  });

  const [adresse, setAdresse] = useState<AdresseForm>({
    adresse: "",
    rue: "",
    ville: "",
    code_postal: "",
    pays: "",
  });

  const [contact, setContact] = useState<ContactForm>({
    telephone: "",
    email: "",
  });

  const [user, setUser] = useState<UserForm>({
    username: "",
    password: "",
  });

  useEffect(() => {
    const admin = getAdminSession();
    if (!admin) navigate("/admin-login");
    fetchMedecins();
  }, [navigate]);

  const fetchMedecins = async () => {
    try {
      const res = await api.get("/medecins");
      setMedecins(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des médecins :", err);
    } finally {
      setLoading(false);
    }
  };

  const captureFaceData = async () => {
    setCaptureLoading(true);
    try {
      const imageBlob = await captureImage();
      const formData = new FormData();
      formData.append("file", imageBlob, "face.jpg");

      const response = await api.post("facial/encode", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.face_encoding) {
        setFaceEncoding(response.data.face_encoding);
        alert("✅ Données faciales capturées avec succès.");
      } else {
        alert("❌ Aucun visage détecté. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur de capture faciale:", err);
      alert("Erreur lors de la capture faciale.");
    } finally {
      setCaptureLoading(false);
    }
  };

  const handleChangeMedecin = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMedecin((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeAdresse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdresse((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeContact = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await api.get(`/medecins/profil/${id}`);
      setMedecin(res.data.medecin);
      setAdresse(res.data.adresse);
      setContact(res.data.contact);
      setUser({ username: res.data.user.username });
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      console.error("Erreur lors du chargement du médecin :", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression du médecin ?")) return;
    try {
      await api.delete(`/medecins/${id}`);
      fetchMedecins();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      user: {
        ...user,
        face_encoding: useFaceRecognition ? faceEncoding : null,
      },
      medecin,
      adresse,
      contact,
    };
    if (useFaceRecognition && !faceEncoding) {
      alert("Veuillez capturer les données faciales avant de continuer.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/medecins/profil/${editingId}`, payload);
      } else {
        await api.post("/medecins", payload);
      }

      fetchMedecins();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  const resetForm = () => {
    setMedecin({
      nom: "",
      prenom: "",
      specialite: "",
      matricule: "",
      genre: "",
      date_naissance: "",
    });
    setAdresse({
      adresse: "",
      rue: "",
      ville: "",
      code_postal: "",
      pays: "",
    });
    setContact({ telephone: "", email: "" });
    setUser({ username: "", password: "" });
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Gestion des Médecins
        </h1>

        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
          >
            {showForm ? "Annuler" : "Ajouter un Médecin"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          >
            <div className="col-span-full">
              <h2 className="text-lg font-semibold text-gray-700">
                Informations personnelles
              </h2>
            </div>

            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={medecin.nom}
              onChange={handleChangeMedecin}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={medecin.prenom}
              onChange={handleChangeMedecin}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="specialite"
              placeholder="Spécialité"
              value={medecin.specialite}
              onChange={handleChangeMedecin}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="matricule"
              placeholder="Matricule"
              value={medecin.matricule}
              onChange={handleChangeMedecin}
              className="p-2 border rounded"
            />
            <select
              name="genre"
              value={medecin.genre}
              onChange={handleChangeMedecin}
              className="p-2 border rounded"
            >
              <option value="">Genre</option>
              <option value="Homme">Masculin</option>
              <option value="Femme">Féminin</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              type="date"
              name="date_naissance"
              value={medecin.date_naissance}
              onChange={handleChangeMedecin}
              className="p-2 border rounded"
            />

            <div className="col-span-full pt-4">
              <h2 className="text-lg font-semibold text-gray-700">Adresse</h2>
            </div>
            <input
              type="text"
              name="adresse"
              placeholder="Adresse"
              value={adresse.adresse}
              onChange={handleChangeAdresse}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="rue"
              placeholder="Rue"
              value={adresse.rue}
              onChange={handleChangeAdresse}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="ville"
              placeholder="Ville"
              value={adresse.ville}
              onChange={handleChangeAdresse}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="code_postal"
              placeholder="Code Postal"
              value={adresse.code_postal}
              onChange={handleChangeAdresse}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="pays"
              placeholder="Pays"
              value={adresse.pays}
              onChange={handleChangeAdresse}
              className="p-2 border rounded"
            />

            <div className="col-span-full pt-4">
              <h2 className="text-lg font-semibold text-gray-700">Contact</h2>
            </div>
            <input
              type="tel"
              name="telephone"
              placeholder="Téléphone"
              value={contact.telephone}
              onChange={handleChangeContact}
              className="p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={contact.email}
              onChange={handleChangeContact}
              className="p-2 border rounded"
            />

            <div className="col-span-full pt-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Compte utilisateur
              </h2>
            </div>
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              value={user.username}
              onChange={handleChangeUser}
              className="p-2 border rounded"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={user.password || ""}
              onChange={handleChangeUser}
              className="p-2 border rounded"
              required={!editingId}
            />

            <div className="col-span-full pt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={useFaceRecognition}
                  onChange={(e) => setUseFaceRecognition(e.target.checked)}
                  className="mr-2"
                />
                Activer la reconnaissance faciale
              </label>
              {useFaceRecognition && (
                <button
                  type="button"
                  onClick={captureFaceData}
                  disabled={captureLoading}
                  className="block mt-2 bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700"
                >
                  {captureLoading
                    ? "Capture en cours..."
                    : "Capturer les données faciales"}
                </button>
              )}
            </div>

            <button
              type="submit"
              className="col-span-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {editingId ? "Modifier le Médecin" : "Ajouter le Médecin"}
            </button>
          </form>
        )}

        {loading ? (
          <p>Chargement des médecins...</p>
        ) : (
          <table className="w-full table-auto border mt-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Nom</th>
                <th className="p-2">Prénom</th>
                <th className="p-2">Spécialité</th>
                <th className="p-2">Genre</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medecins.map((m) => (
                <tr key={m._id} className="text-center border-t">
                  <td className="p-2">{m.nom}</td>
                  <td className="p-2">{m.prenom}</td>
                  <td className="p-2">{m.specialite}</td>
                  <td className="p-2">{m.genre}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="text-yellow-600 hover:underline"
                      onClick={() => handleEdit(m.user_id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(m._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {medecins.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Aucun médecin enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMedecins;
