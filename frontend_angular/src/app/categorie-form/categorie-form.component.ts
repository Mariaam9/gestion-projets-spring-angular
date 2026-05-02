import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategorieService } from '../../Services/categorie.service';

@Component({
  selector: 'app-categorie-form',
  templateUrl: './categorie-form.component.html',
  styleUrls: ['./categorie-form.component.css']
})
export class CategorieFormComponent implements OnInit {
  isEditMode: boolean = false;
  id: number | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';

  formData = {
    nom: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.id = +params['id'];
        this.loadCategorie();
      }
    });
  }

  loadCategorie(): void {
    if (!this.id) return;

    this.loading = true;
    this.error = '';

    this.categorieService.GetAllCategories().subscribe({
      next: (categories) => {
        const categorie = (categories || []).find((c: any) => Number(c.id) === Number(this.id));

        if (!categorie) {
          this.error = 'Catégorie introuvable.';
          this.loading = false;
          return;
        }

        this.formData = {
          nom: categorie.nom || '',
          description: categorie.description || ''
        };

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement de la catégorie.';
      }
    });
  }

  onSubmit(): void {
    this.error = '';

    if (!this.formData.nom.trim()) {
      this.error = 'Le nom de la catégorie est obligatoire.';
      return;
    }

    this.saving = true;

    const payload = {
      nom: this.formData.nom.trim(),
      description: this.formData.description.trim()
    };

    if (this.isEditMode && this.id) {
      this.categorieService.UpdateCategorie(this.id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/categories']);
        },
        error: (err: any) => {
          this.saving = false;
          this.error = err.error?.message || 'Erreur lors de la modification de la catégorie.';
        }
      });
    } else {
      this.categorieService.AddCategorie(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/categories']);
        },
        error: (err: any) => {
          this.saving = false;
          this.error = err.error?.message || 'Erreur lors de la création de la catégorie.';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
