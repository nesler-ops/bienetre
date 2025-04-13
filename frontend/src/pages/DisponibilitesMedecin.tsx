import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";

const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];

const heuresParDefaut = Array.from(
  { length: 10 },
  (_, i) => `${(9 + i).toString().padStart(2, "0")}:00`
);

const DisponibilitesMedecin = () => {
  const [disponibilites, setDisponibilites] = useState<
    Record<string, string[]>
  >({});
  const [heuresReservees, setHeuresReservees] = useState<
    Record<string, string[]>
  >({});
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const user = getUserSession();
    if (user?.user_id) {
      setUserId(user.user_id);
      fetchDisponibilites(user.user_id);
    }
  }, []);

  const fetchDisponibilites = async (id: string) => {
    const allDisponibilites: Record<string, string[]> = {};
    const allReservees: Record<string, string[]> = {};

    for (const jour of joursSemaine) {
      try {
        const dispoRes = await api.get(`/disponibilites/${id}/${jour}`);
        allDisponibilites[jour] = dispoRes.data.heures;

        const rendezvousRes = await api.get(`/rendezvous/${id}`);
        const rendezvous = rendezvousRes.data;

        const joursFR = {
          Monday: "lundi",
          Tuesday: "mardi",
          Wednesday: "mercredi",
          Thursday: "jeudi",
          Friday: "vendredi",
        };

        const heures = rendezvous
          .filter((r: any) => {
            const d = new Date(r.date);
            const jourRDV =
              joursFR[d.toLocaleDateString("fr-FR", { weekday: "long" })];
            return (
              r.medecin_id === id && jourRDV === jour && r.statut !== "Annulé"
            );
          })
          .map((r: any) => r.heure);

        allReservees[jour] = heures;
      } catch {
        allDisponibilites[jour] = [];
        allReservees[jour] = [];
      }
    }

    setDisponibilites(allDisponibilites);
    setHeuresReservees(allReservees);
  };

  const handleHeureChange = (jour: string, index: number, value: string) => {
    const updated = { ...disponibilites };
    updated[jour][index] = value;
    setDisponibilites(updated);
  };

  const addHeure = (jour: string) => {
    const updated = { ...disponibilites };
    updated[jour] = [...(updated[jour] || []), ""];
    setDisponibilites(updated);
  };

  const removeHeure = (jour: string, index: number) => {
    const updated = { ...disponibilites };
    updated[jour].splice(index, 1);
    setDisponibilites(updated);
  };

  const saveJour = async (jour: string) => {
    try {
      await api.put(
        `/disponibilites/${userId}/${jour}`,
        disponibilites[jour], // 👈 lista pura de strings
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(`✅ ${jour} mis à jour !`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage(`❌ Erreur lors de la mise à jour de ${jour}`);
    }
  };

  const resetJour = (jour: string) => {
    const heuresNonReservees = heuresParDefaut.filter(
      (heure) => !heuresReservees[jour]?.includes(heure)
    );
    const updated = { ...disponibilites };
    updated[jour] = heuresNonReservees;
    setDisponibilites(updated);
    setMessage(`↺ ${jour} réinitialisé aux valeurs par défaut`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Disponibilités du Médecin
      </h1>
      {message && (
        <div className="mb-4 text-center text-green-600">{message}</div>
      )}

      {joursSemaine.map((jour) => (
        <div key={jour} className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold capitalize mb-2">{jour}</h2>

          {(disponibilites[jour] || []).map((heure, idx) => {
            const estReservee = heuresReservees[jour]?.includes(heure);
            return (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="time"
                  value={heure}
                  disabled={estReservee}
                  onChange={(e) => handleHeureChange(jour, idx, e.target.value)}
                  className={`border p-1 rounded w-40 ${
                    estReservee
                      ? "bg-red-200 text-gray-600 cursor-not-allowed"
                      : ""
                  }`}
                />
                {!estReservee && (
                  <button
                    onClick={() => removeHeure(jour, idx)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                )}
                {estReservee && (
                  <span className="text-sm text-red-600">Déjà réservé</span>
                )}
              </div>
            );
          })}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => addHeure(jour)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              + Ajouter une heure
            </button>
            <button
              onClick={() => saveJour(jour)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              💾 Sauvegarder {jour}
            </button>
            <button
              onClick={() => resetJour(jour)}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              ↺ Réinitialiser {jour}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DisponibilitesMedecin;
