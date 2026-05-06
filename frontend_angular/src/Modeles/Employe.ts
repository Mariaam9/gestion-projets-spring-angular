import { Utilisateur } from './Utilisateur';
import { Categorie } from './Categorie';

export interface Employe extends Utilisateur {
  matricule?: string;
  categorie?: Categorie;
  categorieId?: number;
  idCategorie?: number;
  categorie_id?: number;
  categorieNom?: string;
  nomCategorie?: string;
  categorie_name?: string;

  // Champs optionnels si votre backend/BD les contient.
  telephone?: string;
  tel?: string;
  phone?: string;
  numeroTelephone?: string;
  statut?: string;
  status?: string;
  nombreProjets?: number;
  projetsCount?: number;
  projets?: any[];
  affectations?: any[];
}
