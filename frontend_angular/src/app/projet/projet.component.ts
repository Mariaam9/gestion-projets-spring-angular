import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AffectationService } from '../../Services/affectation.service';
import { EmployeService } from '../../Services/employe.service';
import { ProjetService } from '../../Services/projet.service';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.css']
})
export class ProjetComponent implements OnInit {
  projets: any[] = [];
  employes: any[] = [];
  allAffectations: any[] = [];

  searchText = '';
  loading = false;
  error = '';

  showAssignmentModal = false;
  selectedProjet: any | null = null;
  modalError = '';
  savingAssignments = false;

  private originalEmployeeIds = new Set<number>();
  private currentEmployeeIds = new Set<number>();
  private originalAffectationByEmployeeId = new Map<number, any>();

  constructor(
    private affectationService: AffectationService,
    private employeService: EmployeService,
    private projetService: ProjetService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      projets: this.projetService.GetAllProjets(),
      employes: this.employeService.GetAllEmployes(),
      affectations: this.affectationService.GetAllAffectations()
    }).subscribe({
      next: ({ projets, employes, affectations }) => {
        this.projets = Array.isArray(projets) ? projets : [];
        this.employes = Array.isArray(employes) ? employes : [];
        this.allAffectations = Array.isArray(affectations) ? affectations : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossible de charger les projets. Vérifiez que le backend est lancé et que le token admin est valide.';
      }
    });
  }

  get filteredProjets(): any[] {
    const query = this.normalizeText(this.searchText);

    if (!query) {
      return this.projets;
    }

    return this.projets.filter((projet) => {
      const employees = this.getProjectEmployees(projet)
        .map((employe) => this.getEmployeFullName(employe))
        .join(' ');

      const searchable = [
        projet?.nom,
        projet?.description,
        this.getProjectStatusLabel(projet),
        employees
      ].join(' ');

      return this.normalizeText(searchable).includes(query);
    });
  }

  goToCreateProjet(): void {
    this.router.navigate(['/projets/create']);
  }

  editProjet(projet: any): void {
    const id = this.toNumber(projet?.id);
    if (!id) {
      return;
    }
    this.router.navigate(['/projets', id, 'edit']);
  }

  deleteProjet(projet: any): void {
    const id = this.toNumber(projet?.id);
    if (!id) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Confirmation',
        message: `Voulez-vous vraiment supprimer le projet « ${projet?.nom || ''} » ?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.projetService.DeleteProjet(id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          this.error = err?.error?.message || 'Erreur lors de la suppression du projet.';
        }
      });
    });
  }

  openAssignmentModal(projet: any): void {
    this.selectedProjet = projet;
    this.modalError = '';
    this.originalEmployeeIds = new Set<number>();
    this.currentEmployeeIds = new Set<number>();
    this.originalAffectationByEmployeeId = new Map<number, any>();

    const projectAffectations = this.getProjectAffectations(projet);

    projectAffectations.forEach((affectation) => {
      const employeeId = this.getAffectationEmployeId(affectation);
      if (!employeeId) {
        return;
      }

      this.originalEmployeeIds.add(employeeId);
      this.currentEmployeeIds.add(employeeId);
      this.originalAffectationByEmployeeId.set(employeeId, affectation);
    });

    this.showAssignmentModal = true;
  }

  closeAssignmentModal(): void {
    if (this.savingAssignments) {
      return;
    }

    this.showAssignmentModal = false;
    this.selectedProjet = null;
    this.modalError = '';
    this.originalEmployeeIds.clear();
    this.currentEmployeeIds.clear();
    this.originalAffectationByEmployeeId.clear();
  }

  addEmployeeToProject(employe: any): void {
    const employeeId = this.toNumber(employe?.id);
    if (!employeeId) {
      return;
    }

    this.currentEmployeeIds.add(employeeId);
  }

  removeEmployeeFromProject(employe: any): void {
    const employeeId = this.toNumber(employe?.id);
    if (!employeeId) {
      return;
    }

    this.currentEmployeeIds.delete(employeeId);
  }

  saveAssignments(): void {
    const projectId = this.toNumber(this.selectedProjet?.id);
    if (!projectId) {
      this.modalError = 'Projet invalide.';
      return;
    }

    const employeesToAdd = Array.from(this.currentEmployeeIds).filter(
      (employeeId) => !this.originalEmployeeIds.has(employeeId)
    );
    const employeesToRemove = Array.from(this.originalEmployeeIds).filter(
      (employeeId) => !this.currentEmployeeIds.has(employeeId)
    );

    const requests: Observable<unknown>[] = [];

    employeesToAdd.forEach((employeeId) => {
      requests.push(
        this.affectationService.AddAffectation({
          employeId: employeeId,
          projetId: projectId,
          dateDebut: this.selectedProjet?.dateDebut || this.getTodayIsoDate(),
          dateFin: this.selectedProjet?.dateFin || undefined
        } as any)
      );
    });

    employeesToRemove.forEach((employeeId) => {
      const affectation = this.originalAffectationByEmployeeId.get(employeeId);
      const affectationId = this.toNumber(affectation?.id);
      if (affectationId) {
        requests.push(this.affectationService.DeleteAffectation(affectationId));
      }
    });

    if (requests.length === 0) {
      this.closeAssignmentModal();
      return;
    }

    this.savingAssignments = true;
    this.modalError = '';

    forkJoin(requests)
      .pipe(finalize(() => (this.savingAssignments = false)))
      .subscribe({
        next: () => {
          this.showAssignmentModal = false;
          this.selectedProjet = null;
          this.loadData();
        },
        error: (err) => {
          this.modalError = err?.error?.message || 'Erreur lors de l’enregistrement des affectations.';
        }
      });
  }

  getProjectAffectations(projet: any): any[] {
    const projectId = this.toNumber(projet?.id || projet?.projetId || projet?.idProjet || projet?.projet_id);
    if (!projectId) {
      return [];
    }

    return this.allAffectations.filter((affectation) => this.getAffectationProjetId(affectation) === projectId);
  }

  getProjectEmployees(projet: any): any[] {
    return this.getProjectAffectations(projet)
      .map((affectation) => this.findEmployeById(this.getAffectationEmployeId(affectation)) || this.employeFromAffectation(affectation))
      .filter(Boolean);
  }

  getAffectedEmployees(): any[] {
    return this.employes.filter((employe) => this.currentEmployeeIds.has(this.toNumber(employe?.id)));
  }

  getAvailableEmployees(): any[] {
    return this.employes.filter((employe) => !this.currentEmployeeIds.has(this.toNumber(employe?.id)));
  }

  getEmployeFullName(employe: any): string {
    const prenom = employe?.prenom || employe?.employePrenom || '';
    const nom = employe?.nom || employe?.employeNom || '';
    const fullName = `${prenom} ${nom}`.trim();
    return fullName || 'Employé';
  }

  getEmployeCategory(employe: any): string {
    return employe?.categorieNom || employe?.categorie?.nom || employe?.categorie || 'Sans catégorie';
  }

  getInitials(employe: any): string {
    const prenom = employe?.prenom || employe?.employePrenom || '';
    const nom = employe?.nom || employe?.employeNom || '';
    const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    return initials || 'EM';
  }

  getProjectStatusLabel(projet: any): string {
    const rawStatus = projet?.statut || projet?.status || '';
    if (rawStatus) {
      return this.formatStatus(rawStatus);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = projet?.dateDebut ? new Date(projet.dateDebut) : null;
    const end = projet?.dateFin ? new Date(projet.dateFin) : null;

    if (start && today < start) {
      return 'En attente';
    }

    if (end && today > end) {
      return 'Terminé';
    }

    return 'En cours';
  }

  getProjectStatusClass(projet: any): string {
    const status = this.normalizeText(this.getProjectStatusLabel(projet));

    if (status.includes('termin')) {
      return 'status-finished';
    }

    if (status.includes('attente')) {
      return 'status-pending';
    }

    if (status.includes('annul')) {
      return 'status-cancelled';
    }

    return 'status-active';
  }

  formatDateRange(projet: any): string {
    const start = projet?.dateDebut || projet?.date_debut || '—';
    const end = projet?.dateFin || projet?.date_fin || '—';
    return `${start} - ${end}`;
  }

  pluralEmploye(count: number): string {
    return count > 1 ? 'employés' : 'employé';
  }

  trackById(index: number, item: any): number {
    // Ne pas utiliser this.toNumber ici : Angular peut appeler trackBy
    // sans conserver correctement le contexte de la classe.
    const id = Number(item?.id ?? item?.projetId ?? item?.idProjet ?? item?.employeId ?? item?.idEmploye);
    return Number.isFinite(id) && id > 0 ? id : index;
  }

  private findEmployeById(id: number): any | null {
    if (!id) {
      return null;
    }

    return this.employes.find((employe) => this.toNumber(employe?.id) === id) || null;
  }

  private employeFromAffectation(affectation: any): any {
    return {
      id: this.getAffectationEmployeId(affectation),
      nom: affectation?.employeNom || affectation?.employe_nom || affectation?.employe?.nom || '',
      prenom: affectation?.employePrenom || affectation?.employe_prenom || affectation?.employe?.prenom || '',
      categorieNom: affectation?.employeCategorieNom || affectation?.employe_categorie_nom || affectation?.employe?.categorieNom || affectation?.employe?.categorie?.nom || ''
    };
  }

  private getAffectationEmployeId(affectation: any): number {
    return this.toNumber(
      affectation?.employeId ||
      affectation?.idEmploye ||
      affectation?.employe_id ||
      affectation?.employe?.id
    );
  }

  private getAffectationProjetId(affectation: any): number {
    return this.toNumber(
      affectation?.projetId ||
      affectation?.idProjet ||
      affectation?.projet_id ||
      affectation?.projet?.id
    );
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeText(value: any): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private formatStatus(value: string): string {
    const normalized = this.normalizeText(value);

    if (normalized.includes('cours') || normalized === 'active' || normalized === 'actif') {
      return 'En cours';
    }

    if (normalized.includes('attente') || normalized.includes('pending')) {
      return 'En attente';
    }

    if (normalized.includes('termin') || normalized.includes('done') || normalized.includes('finished')) {
      return 'Terminé';
    }

    if (normalized.includes('annul') || normalized.includes('cancel')) {
      return 'Annulé';
    }

    return value;
  }

  private getTodayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
