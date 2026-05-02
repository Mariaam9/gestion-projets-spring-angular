import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetService } from '../../Services/projet.service';

@Component({
  selector: 'app-projet-form',
  templateUrl: './projet-form.component.html',
  styleUrls: ['./projet-form.component.css']
})
export class ProjetFormComponent implements OnInit {
  isEditMode: boolean = false;
  id: number | null = null;
  loading: boolean = false;
  error: string = '';
  
  formData = {
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.id = +params['id'];
        this.loadProjet();
      }
    });
  }

  loadProjet(): void {
    if (!this.id) return;
    this.loading = true;
    
    // Récupérer tous les projets et trouver celui avec l'ID
    this.projetService.GetAllProjets().subscribe({
      next: (data) => {
        const projet = data.find(p => p.id === this.id);
        if (projet) {
          this.formData = {
            nom: projet.nom,
            description: projet.description || '',
            dateDebut: projet.dateDebut || '',
            dateFin: projet.dateFin || ''
          };
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement';
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.nom) {
      this.error = 'Le nom du projet est obligatoire';
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isEditMode && this.id) {
      this.projetService.UpdateProjet(this.id, this.formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/projets']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la modification';
          this.loading = false;
        }
      });
    } else {
      this.projetService.AddProjet(this.formData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/projets']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la création';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projets']);
  }
}