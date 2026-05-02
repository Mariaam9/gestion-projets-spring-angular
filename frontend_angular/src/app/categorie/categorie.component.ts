import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategorieService } from '../../Services/categorie.service';
import { EmployeService } from '../../Services/employe.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Categorie } from '../../Modeles/Categorie';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];
  employes: any[] = [];
  loading = false;
  searchText = '';
  error = '';

  constructor(
    private categorieService: CategorieService,
    private employeService: EmployeService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadEmployesForCounts();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    this.categorieService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.categories = [];
        this.filteredCategories = [];
        this.loading = false;
        this.error = 'Impossible de charger les catégories depuis la base de données.';
      }
    });
  }

  loadEmployesForCounts(): void {
    this.employeService.GetAllEmployes().subscribe({
      next: (data) => {
        this.employes = data || [];
      },
      error: () => {
        this.employes = [];
      }
    });
  }

  applyFilter(): void {
    const query = this.normalize(this.searchText);

    if (!query) {
      this.filteredCategories = [...this.categories];
      return;
    }

    this.filteredCategories = this.categories.filter((categorie) => {
      const nom = this.normalize(categorie.nom);
      const description = this.normalize(categorie.description || '');
      return nom.includes(query) || description.includes(query);
    });
  }

  createCategorie(): void {
    this.router.navigate(['/categories/create']);
  }

  editCategorie(id?: number): void {
    if (!id) return;
    this.router.navigate(['/categories', id, 'edit']);
  }

  deleteCategorie(id?: number): void {
    if (!id) return;

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment supprimer cette catégorie ?'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categorieService.DeleteCategorie(id).subscribe({
          next: () => {
            this.loadCategories();
            this.loadEmployesForCounts();
          },
          error: () => {
            this.error = 'Suppression impossible. Cette catégorie est peut-être liée à des employés.';
          }
        });
      }
    });
  }

  getEmployeeCount(categorie: any): number {
    const directCount = categorie.nombreEmployes ?? categorie.nbEmployes ?? categorie.employesCount ?? categorie.count;
    const parsedCount = Number(directCount);

    if (directCount !== undefined && directCount !== null && !Number.isNaN(parsedCount)) {
      return parsedCount;
    }

    if (Array.isArray(categorie.employes)) {
      return categorie.employes.length;
    }

    return this.employes.filter((employe) => this.isEmployeInCategorie(employe, categorie)).length;
  }

  getCardClass(index: number): string {
    const classes = ['blue', 'cyan', 'purple', 'cyan', 'purple', 'blue'];
    return classes[index % classes.length];
  }

  trackByCategorieId(index: number, categorie: Categorie): number {
    return categorie.id || index;
  }

  private isEmployeInCategorie(employe: any, categorie: any): boolean {
    const employeCategorieId = employe.categorieId ?? employe.categorie?.id ?? employe.categoryId;
    const employeCategorieNom = employe.categorieNom ?? employe.categorie?.nom ?? employe.categoryName;

    if (categorie.id !== undefined && categorie.id !== null && employeCategorieId !== undefined && employeCategorieId !== null) {
      return Number(employeCategorieId) === Number(categorie.id);
    }

    if (employeCategorieNom && categorie.nom) {
      return this.normalize(employeCategorieNom) === this.normalize(categorie.nom);
    }

    return false;
  }

  private normalize(value: string): string {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
