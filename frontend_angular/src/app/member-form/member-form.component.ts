import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeService } from '../../Services/employe.service';
import { CategorieService } from '../../Services/categorie.service';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css']
})
export class MemberFormComponent implements OnInit {
  isEditMode: boolean = false;
  id: number | null = null;
  loading: boolean = false;
  error: string = '';
  
  formData = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    matricule: '',
    categorieId: null as number | null
  };
  
  categories: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeService: EmployeService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.id = +params['id'];
        this.loadEmploye();
      }
    });
  }

  loadCategories(): void {
    this.categorieService.GetAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  loadEmploye(): void {
    if (!this.id) return;
    this.loading = true;
    this.employeService.GetEmployeById(this.id).subscribe({
      next: (data) => {
        this.formData = {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          password: '',
          matricule: data.matricule || '',
          categorieId: data.categorieId || data.categorie?.id || null
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement';
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    if (!this.isEditMode && !this.formData.password) {
      this.error = 'Le mot de passe est obligatoire';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isEditMode && this.id) {
      this.employeService.UpdateEmploye(this.id, this.formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/members']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la modification';
          this.loading = false;
        }
      });
    } else {
      this.employeService.AddEmploye(this.formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/members']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la création';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/members']);
  }
}