export interface Projet {
  id?: number;
  nom: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  status?: string;

  // Champs optionnels selon la forme du JSON backend
  date_debut?: string;
  date_fin?: string;
  employesCount?: number;
}
