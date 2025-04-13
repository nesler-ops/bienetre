export interface RendezvousType {
  _id?: string; // Optionnel si non encore enregistré
  date: string;
  heure: string;
  medecin_id: string;
  patient_id: string;
  type: string;
  motif: string;
  statut?: string; // "Confirmé", "En attente", "Annulé" (optionnel)
}

export interface UserType {
  username: string;
  password: string;
  user_type: "Patient" | "Médecin";
}
