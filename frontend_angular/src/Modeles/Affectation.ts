export interface Affectation {
  id?: number;

  employeId?: number;
  idEmploye?: number;
  employe_id?: number;

  projetId?: number;
  idProjet?: number;
  projet_id?: number;

  dateDebut?: string;
  date_debut?: string;
  dateFin?: string;
  date_fin?: string;

  employeNom?: string;
  employePrenom?: string;
  employeCategorieNom?: string;
  employeEmail?: string;
  employe_email?: string;
  email?: string;
  mail?: string;
  projetNom?: string;

  employe?: any;
  projet?: any;
}
