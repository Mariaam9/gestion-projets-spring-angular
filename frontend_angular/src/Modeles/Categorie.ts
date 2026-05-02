export interface Categorie {
  id?: number;
  nom: string;
  description?: string;

  // Champs optionnels si le backend renvoie directement un compteur.
  // Sinon, la page calcule ce nombre depuis les employés chargés depuis la BD.
  nombreEmployes?: number;
  nbEmployes?: number;
  employeCount?: number;
  employesCount?: number;
  totalEmployes?: number;
}
