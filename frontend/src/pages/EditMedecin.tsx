import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar"; // ✅ Navbar inchangé

interface MedecinType {
  _id: string;
  username: string;
  nom: string;
  specialite: string;
}

const EditMedecin = () => {
  const { medecinId } = useParams<{ medecinId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MedecinType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedecin = async () => {
      try {
        const response = await api.get(`/medecins/${medecinId}`);
        setFormData(response.data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des données du médecin :",
          error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMedecin();
  }, [medecinId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/medecins/${medecinId}`, formData);
      alert("✅ Informations mises à jour avec succès");
      navigate("/dashboard-medecin");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour des données du médecin :",
        error
      );
      alert("❌ Erreur lors de la mise à jour des informations");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!formData) return <p>Médecin introuvable</p>;

  return (
    <div className="bg-green-100 min-h-screen">
      <Navbar />
      <div className="flex h-screen items-center justify-center">
        <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-4">
            Modifier le Médecin
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
              placeholder="Nom d'utilisateur"
            />
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
              placeholder="Nom Complet"
            />
            <input
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
              placeholder="Spécialité"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded"
            >
              Enregistrer les Modifications
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedecin;
