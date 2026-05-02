import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffectationService } from '../../Services/affectation.service';
import { AuthService } from '../../Services/auth.service';
import { EmployeService } from '../../Services/employe.service';
import { ProjetService } from '../../Services/projet.service';
import { Affectation } from '../../Modeles/Affectation';
import { Employe } from '../../Modeles/Employe';
import { Projet } from '../../Modeles/Projet';

interface CollaborateurView {
  id: number;
  nomComplet: string;
  initials: string;
  dateDebut?: string;
  dateFin?: string;
  email?: string;
}

interface ProjetEmployeView {
  id: number;
  nom: string;
  description: string;
  dateDebut?: string;
  dateFin?: string;
  progression: number;
  statut: 'En cours' | 'En attente' | 'Terminé';
  statutClass: 'in-progress' | 'pending' | 'done';
  accentClass: 'blue' | 'purple' | 'cyan';
  collaborateurs: CollaborateurView[];
  expanded: boolean;
}

@Component({
  selector: 'app-dashboard-employe',
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.css']
})
export class DashboardEmployeComponent implements OnInit {
  loading = false;
  error = '';

  currentUser: any = null;
  profil: Employe | null = null;
  projets: ProjetEmployeView[] = [];
  employesReference: Employe[] = [];
  isSidebarCollapsed = false;
  isProfileMenuOpen = false;

  stats = {
    projetsActifs: 0,
    collaborateurs: 0,
    progressionMoyenne: 0
  };

  private readonly accents: Array<'blue' | 'purple' | 'cyan'> = ['blue', 'purple', 'cyan'];

  constructor(
    private affectationService: AffectationService,
    private projetService: ProjetService,
    private employeService: EmployeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfil();
    this.loadMesProjets();
  }

  loadProfil(): void {
    this.employeService.GetProfil().pipe(
      catchError(() => of(null))
    ).subscribe((profil) => {
      this.profil = profil;
    });
  }

  loadMesProjets(): void {
    this.loading = true;
    this.error = '';

    this.affectationService.GetMesAffectations().subscribe({
      next: (affectations) => {
        this.prepareDashboardFromAffectations(affectations || []);
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger vos projets depuis la base de données.';
      }
    });
  }

  private prepareDashboardFromAffectations(affectations: Affectation[]): void {
    const mesAffectations = this.uniqueByProjet(affectations);

    const affectationsAvecProjetId = mesAffectations
      .map((affectation) => ({
        affectation,
        projetId: this.getAffectationProjetId(affectation)
      }))
      .filter((item): item is { affectation: Affectation; projetId: number } => item.projetId !== null);

    if (affectationsAvecProjetId.length === 0) {
      this.projets = [];
      this.updateStats();
      this.loading = false;
      return;
    }

    const collaborateursRequests = affectationsAvecProjetId.map((item) =>
      this.affectationService.GetEmployesByProjetForEmploye(item.projetId).pipe(
        catchError(() => of([] as Affectation[]))
      )
    );

    forkJoin({
      projetsBd: this.projetService.GetAllProjetsForEmploye().pipe(
        catchError(() => of([] as Projet[]))
      ),
      // Source de secours pour récupérer l'email si l'endpoint collaborateurs
      // retourne seulement employeId/employeNom/employePrenom.
      employesBd: this.employeService.GetAllEmployes().pipe(
        catchError(() => of([] as Employe[]))
      ),
      collaborateursParProjet: forkJoin(collaborateursRequests)
    }).subscribe({
      next: ({ projetsBd, employesBd, collaborateursParProjet }) => {
        this.employesReference = Array.isArray(employesBd) ? employesBd : [];

        this.projets = affectationsAvecProjetId.map((item, index) => {
          const projetBd = (projetsBd as Projet[]).find((p: Projet) => this.toNumber((p as any)?.id) === item.projetId);
          const collaborateurs = collaborateursParProjet[index] || [];
          return this.toProjetView(item.affectation, projetBd, collaborateurs, index, item.projetId);
        });

        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.employesReference = [];
        this.projets = affectationsAvecProjetId.map((item, index) =>
          this.toProjetView(item.affectation, undefined, [], index, item.projetId)
        );
        this.updateStats();
        this.loading = false;
      }
    });
  }

  private uniqueByProjet(affectations: Affectation[]): Affectation[] {
    const map = new Map<number, Affectation>();

    affectations.forEach((affectation) => {
      const projetId = this.getAffectationProjetId(affectation);
      if (projetId !== null && !map.has(projetId)) {
        map.set(projetId, affectation);
      }
    });

    return Array.from(map.values());
  }

  private toProjetView(
    affectation: Affectation,
    projetBd: Projet | undefined,
    collaborateursAffectations: Affectation[],
    index: number,
    projetId: number
  ): ProjetEmployeView {
    const dateDebut =
      this.getProjetDateDebut(projetBd) ||
      (affectation as any)?.projetDateDebut ||
      this.getAffectationDateDebut(affectation);

    const dateFin =
      this.getProjetDateFin(projetBd) ||
      (affectation as any)?.projetDateFin ||
      this.getAffectationDateFin(affectation);

    const progression = this.calculateProgress(dateDebut, dateFin);
    const statut = this.getStatus(dateDebut, dateFin);

    return {
      id: projetId,
      nom: (projetBd as any)?.nom || (affectation as any)?.projetNom || `Projet ${projetId}`,
      description: (projetBd as any)?.description || (affectation as any)?.projetDescription || 'Aucune description enregistrée pour ce projet.',
      dateDebut,
      dateFin,
      progression,
      statut,
      statutClass: this.getStatusClass(statut),
      accentClass: this.accents[index % this.accents.length],
      collaborateurs: this.toCollaborateurs(collaborateursAffectations),
      expanded: false
    };
  }

  private toCollaborateurs(affectations: Affectation[]): CollaborateurView[] {
    const map = new Map<number, CollaborateurView>();

    affectations.forEach((affectation) => {
      const employeId = this.getAffectationEmployeId(affectation);
      if (employeId === null || map.has(employeId)) {
        return;
      }

      const employeRef = this.findEmployeReference(employeId);
      const prenom =
        (affectation as any)?.employePrenom ||
        (affectation as any)?.prenom ||
        (affectation as any)?.employe?.prenom ||
        employeRef?.prenom ||
        '';
      const nom =
        (affectation as any)?.employeNom ||
        (affectation as any)?.nom ||
        (affectation as any)?.employe?.nom ||
        employeRef?.nom ||
        '';
      const nomComplet = `${prenom} ${nom}`.trim() || `Employé ${employeId}`;

      map.set(employeId, {
        id: employeId,
        nomComplet,
        initials: this.getInitials(prenom, nom),
        email: this.getCollaborateurEmail(affectation, employeRef),
        dateDebut: this.getAffectationDateDebut(affectation),
        dateFin: this.getAffectationDateFin(affectation)
      });
    });

    return Array.from(map.values());
  }

  private updateStats(): void {
    const currentUserId = this.toNumber(this.currentUser?.id);
    const uniqueCollaborateurs = new Set<number>();

    this.projets.forEach((projet) => {
      projet.collaborateurs.forEach((collaborateur) => {
        if (currentUserId === null || collaborateur.id !== currentUserId) {
          uniqueCollaborateurs.add(collaborateur.id);
        }
      });
    });

    const totalProgression = this.projets.reduce((sum, projet) => sum + projet.progression, 0);

    this.stats = {
      projetsActifs: this.projets.filter((projet) => projet.statut !== 'Terminé').length,
      collaborateurs: uniqueCollaborateurs.size,
      progressionMoyenne: this.projets.length ? Math.round(totalProgression / this.projets.length) : 0
    };
  }

  private calculateProgress(dateDebut?: string, dateFin?: string): number {
    if (!dateDebut || !dateFin) {
      return 0;
    }

    const start = new Date(dateDebut).getTime();
    const end = new Date(dateFin).getTime();
    const now = Date.now();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return 0;
    }

    const ratio = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(ratio)));
  }

  private getStatus(dateDebut?: string, dateFin?: string): 'En cours' | 'En attente' | 'Terminé' {
    const now = Date.now();
    const start = dateDebut ? new Date(dateDebut).getTime() : NaN;
    const end = dateFin ? new Date(dateFin).getTime() : NaN;

    if (!Number.isNaN(end) && now > end) {
      return 'Terminé';
    }

    if (!Number.isNaN(start) && now < start) {
      return 'En attente';
    }

    return 'En cours';
  }

  private getStatusClass(statut: 'En cours' | 'En attente' | 'Terminé'): 'in-progress' | 'pending' | 'done' {
    if (statut === 'Terminé') {
      return 'done';
    }
    if (statut === 'En attente') {
      return 'pending';
    }
    return 'in-progress';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleProject(project: ProjetEmployeView): void {
    project.expanded = !project.expanded;
  }

  getUserFullName(): string {
    const user = this.profil || this.currentUser;
    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();
    return fullName || 'Employé';
  }

  getUserEmail(): string {
    return this.profil?.email || this.currentUser?.email || 'email non disponible';
  }

  getInitials(prenom?: string, nom?: string): string {
    const p = prenom?.trim().charAt(0) || '';
    const n = nom?.trim().charAt(0) || '';
    const initials = `${p}${n}`.toUpperCase();
    return initials || 'GP';
  }

  getCurrentUserInitials(): string {
    const user = this.profil || this.currentUser;
    return this.getInitials(user?.prenom, user?.nom);
  }

  logout(): void {
    this.isProfileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByProjetId(_: number, project: ProjetEmployeView): number {
    return project.id;
  }

  private getCollaborateurEmail(affectation: Affectation, employeRef?: Employe): string {
    return (
      (affectation as any)?.employeEmail ||
      (affectation as any)?.email ||
      (affectation as any)?.employe_email ||
      (affectation as any)?.mail ||
      (affectation as any)?.employe?.email ||
      (affectation as any)?.utilisateur?.email ||
      (employeRef as any)?.email ||
      ''
    );
  }

  private findEmployeReference(id: number): Employe | undefined {
    return this.employesReference.find((employe) => this.toNumber((employe as any)?.id) === id);
  }

  private getAffectationProjetId(affectation: Affectation): number | null {
    return this.firstNumber(
      (affectation as any)?.projetId,
      (affectation as any)?.idProjet,
      (affectation as any)?.projet_id,
      (affectation as any)?.projet?.id
    );
  }

  private getAffectationEmployeId(affectation: Affectation): number | null {
    return this.firstNumber(
      (affectation as any)?.employeId,
      (affectation as any)?.idEmploye,
      (affectation as any)?.employe_id,
      (affectation as any)?.employe?.id,
      // Certains endpoints /employe/projets/{id}/employes retournent directement
      // des objets Employe: { id, nom, prenom, email }.
      ((affectation as any)?.email || (affectation as any)?.role || (affectation as any)?.matricule) ? (affectation as any)?.id : null
    );
  }

  private getAffectationDateDebut(affectation: Affectation): string | undefined {
    return (affectation as any)?.dateDebut || (affectation as any)?.date_debut;
  }

  private getAffectationDateFin(affectation: Affectation): string | undefined {
    return (affectation as any)?.dateFin || (affectation as any)?.date_fin;
  }

  private getProjetDateDebut(projet?: Projet): string | undefined {
    return (projet as any)?.dateDebut || (projet as any)?.date_debut;
  }

  private getProjetDateFin(projet?: Projet): string | undefined {
    return (projet as any)?.dateFin || (projet as any)?.date_fin;
  }

  private firstNumber(...values: unknown[]): number | null {
    for (const value of values) {
      const parsed = this.toNumber(value);
      if (parsed !== null) {
        return parsed;
      }
    }

    return null;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
