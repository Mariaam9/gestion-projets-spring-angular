import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EmployeService } from '../../Services/employe.service';
import { AffectationService } from '../../Services/affectation.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Employe } from '../../Modeles/Employe';
import { Affectation } from '../../Modeles/Affectation';

type EmployeRow = Employe & {
  fullName: string;
  initial: string;
  categorieLabel: string;
  telephoneLabel: string;
  statutLabel: string;
  projetsCount: number;
};

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {
  dataSource: EmployeRow[] = [];
  allEmployes: EmployeRow[] = [];
  loading = false;
  searchText = '';
  error = '';

  constructor(
    private employeService: EmployeService,
    private affectationService: AffectationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployes();
  }

  loadEmployes(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      employes: this.employeService.GetAllEmployes().pipe(
        catchError(() => {
          this.error = 'Impossible de charger les employés depuis la base de données.';
          return of([] as Employe[]);
        })
      ),
      affectations: this.affectationService.GetAllAffectations().pipe(
        catchError(() => of([] as Affectation[]))
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ employes, affectations }) => {
        this.allEmployes = this.buildRows(employes || [], affectations || []);
        this.applyFilter();
      });
  }

  applyFilter(): void {
    const q = (this.searchText || '').trim().toLowerCase();

    if (!q) {
      this.dataSource = [...this.allEmployes];
      return;
    }

    this.dataSource = this.allEmployes.filter((employe) =>
      [
        employe.nom,
        employe.prenom,
        employe.fullName,
        employe.email,
        employe.matricule,
        employe.categorieLabel,
        employe.telephoneLabel,
        employe.statutLabel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  editEmploye(id?: number): void {
    if (!id) return;
    this.router.navigate([`/members/${id}/edit`]);
  }

  deleteEmploye(id?: number): void {
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer cet employé ?'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeService.DeleteEmploye(id).subscribe({
          next: () => this.loadEmployes(),
          error: () => {
            this.error = 'Suppression impossible. Vérifiez le backend et les affectations liées à cet employé.';
          }
        });
      }
    });
  }

  isInactive(statut: string): boolean {
    return (statut || '').toLowerCase().includes('inact');
  }

  trackByEmployeId(_: number, employe: EmployeRow): number | undefined {
    return employe.id;
  }

  private buildRows(employes: Employe[], affectations: Affectation[]): EmployeRow[] {
    const projetsParEmploye = new Map<number, Set<number>>();

    (affectations || []).forEach((affectation: any) => {
      const employeId = Number(affectation.employeId ?? affectation.employe?.id);
      const projetId = Number(affectation.projetId ?? affectation.projet?.id);

      if (!Number.isFinite(employeId) || !Number.isFinite(projetId)) return;

      if (!projetsParEmploye.has(employeId)) {
        projetsParEmploye.set(employeId, new Set<number>());
      }

      projetsParEmploye.get(employeId)?.add(projetId);
    });

    return (employes || []).map((employe: any) => {
      const id = Number(employe.id);
      const nom = employe.nom || '';
      const prenom = employe.prenom || '';
      const fullName = [prenom, nom].filter(Boolean).join(' ') || employe.email || 'Employé';
      const projetsCountFromAffectations = Number.isFinite(id)
        ? projetsParEmploye.get(id)?.size ?? 0
        : 0;

      return {
        ...employe,
        fullName,
        initial: this.getInitial(prenom, nom, employe.email),
        categorieLabel: employe.categorieNom || employe.categorie?.nom || '—',
        telephoneLabel:
          employe.telephone ||
          employe.tel ||
          employe.phone ||
          employe.numeroTelephone ||
          '—',
        statutLabel: employe.statut || employe.status || 'Actif',
        projetsCount:
          employe.nombreProjets ??
          employe.projetsCount ??
          employe.projets?.length ??
          employe.affectations?.length ??
          projetsCountFromAffectations
      } as EmployeRow;
    });
  }

  private getInitial(prenom?: string, nom?: string, email?: string): string {
    return (prenom?.charAt(0) || nom?.charAt(0) || email?.charAt(0) || '?').toUpperCase();
  }
}
