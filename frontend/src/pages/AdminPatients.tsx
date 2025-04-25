import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAdminSession } from "../services/auth";
import { captureImage } from "../services/faceAuth";

interface Patient {
  nom: string;
  prenom: string;
  numero_assurance: string;
  date_naissance: string;
  genre: string;
}

interface Adresse {
  adresse: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface Contact {
  telephone: string;
  email: string;
}

interface UserPatient {
  username: string;
  password?: string;
}

interface FullPatient {
  _id: string;
  user_id: string;
  nom: string;
  prenom: string;
  numero_assurance: string;
  genre: string;
  date_naissance: string;
}

const AdminPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<FullPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [patient, setPatient] = useState<Patient>({
    nom: "",
    prenom: "",
    numero_assurance: "",
    date_naissance: "",
    genre: "",
  });

  const [adresse, setAdresse] = useState<Adresse>({
    adresse: "",
    rue: "",
    ville: "",
    code_postal: "",
    pays: "",
  });

  const [contact, setContact] = useState<Contact>({
    telephone: "",
    email: "",
  });

  const [user, setUser] = useState<UserPatient>({
    username: "",
    password: "",
  });

  const [useFaceRecognition, setUseFaceRecognition] = useState(false);
  const [faceEncoding, setFaceEncoding] = useState<number[] | null>(null);
  const [captureLoading, setCaptureLoading] = useState(false);

  useEffect(() => {
    const admin = getAdminSession();
    if (!admin) navigate("/admin-login");
    fetchPatients();
  }, [navigate]);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des patients :", err);
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

  const handleChangePatient = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
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
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data.patient);
      setAdresse(res.data.adresse);
      setContact(res.data.contact);
      setUser({ username: res.data.patient.username });
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      console.error("Erreur lors du chargement du patient :", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Confirmer la suppression du patient ?")) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      user,
      patient,
      adresse,
      contact,
    };

    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, {
          patient,
          adresse,
          contact,
        });
      } else {
        const res = await api.post("/userpatients", {
          username: user.username,
          password: user.password,
          user_type: "Patient",
          face_encoding: useFaceRecognition ? faceEncoding : null,
        });

        const userId = res.data.user_id;

        await api.post("/patients", {
          user_id: userId,
          ...patient,
          ...adresse,
          ...contact,
        });
      }

      fetchPatients();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  const resetForm = () => {
    setPatient({
      nom: "",
      prenom: "",
      numero_assurance: "",
      date_naissance: "",
      genre: "",
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
    setFaceEncoding(null);
    setUseFaceRecognition(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Gestion des Patients
        </h1>

        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
          >
            {showForm ? "Annuler" : "Ajouter un Patient"}
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
              value={patient.nom}
              onChange={handleChangePatient}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={patient.prenom}
              onChange={handleChangePatient}
              required
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="numero_assurance"
              placeholder="Numéro d'assurance"
              value={patient.numero_assurance}
              onChange={handleChangePatient}
              required
              className="p-2 border rounded"
            />
            <input
              type="date"
              name="date_naissance"
              value={patient.date_naissance}
              onChange={handleChangePatient}
              required
              className="p-2 border rounded"
            />
            <select
              name="genre"
              value={patient.genre}
              onChange={handleChangePatient}
              className="p-2 border rounded"
              required
            >
              <option value="">Genre</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>

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
              {editingId ? "Modifier le Patient" : "Ajouter le Patient"}
            </button>
          </form>
        )}

        {loading ? (
          <p>Chargement des patients...</p>
        ) : (
          <table className="w-full table-auto border mt-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Nom</th>
                <th className="p-2">Prénom</th>
                <th className="p-2">Assurance</th>
                <th className="p-2">Genre</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="text-center border-t">
                  <td className="p-2">{p.nom}</td>
                  <td className="p-2">{p.prenom}</td>
                  <td className="p-2">{p.numero_assurance}</td>
                  <td className="p-2">{p.genre}</td>
                  <td className="p-2 space-x-2">
                    <button
                      className="text-yellow-600 hover:underline"
                      onClick={() => handleEdit(p.user_id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(p.user_id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Aucun patient enregistré.
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

export default AdminPatients;
