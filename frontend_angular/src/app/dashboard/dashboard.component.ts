import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

import { EmployeService } from '../../Services/employe.service';
import { ProjetService } from '../../Services/projet.service';
import { CategorieService } from '../../Services/categorie.service';
import { AffectationService } from '../../Services/affectation.service';
import { Employe } from '../../Modeles/Employe';
import { Projet } from '../../Modeles/Projet';
import { Categorie } from '../../Modeles/Categorie';
import { Affectation } from '../../Modeles/Affectation';

Chart.register(...registerables);

interface StatCard {
  label: string;
  value: number | string;
  detail: string;
  icon: string;
  tone: 'blue' | 'cyan' | 'violet' | 'teal';
  route: string;
}

interface LegendItem {
  label: string;
  value: number;
  color: string;
}

interface ActivityItem {
  title: string;
  subtitle: string;
  time: string;
  color: string;
  sortDate: Date;
}

type ProjectStatus = 'En cours' | 'Terminés' | 'En attente' | 'Annulés';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  errorMessage = '';
  failedSources: string[] = [];

  employes: Employe[] = [];
  projets: Projet[] = [];
  categories: Categorie[] = [];
  affectations: Affectation[] = [];

  totalEmployes = 0;
  projetsActifs = 0;
  totalCategories = 0;
  tauxAffectation = 0;

  statCards: StatCard[] = [];
  projectLegend: LegendItem[] = [];
  categoryLegend: LegendItem[] = [];
  recentActivities: ActivityItem[] = [];

  readonly projectColors = ['#3b82f6', '#0ea5e9', '#6366f1', '#94a3b8'];
  readonly categoryColors = ['#3b82f6', '#0ea5e9', '#6366f1', '#94a3b8', '#14b8a6', '#f59e0b', '#ef4444'];

  pieChartType: 'pie' = 'pie';
  doughnutChartType: 'doughnut' = 'doughnut';
  lineChartType: 'line' = 'line';

  projectChartData: ChartData<'pie', number[], string> = {
    labels: ['En cours', 'Terminés', 'En attente', 'Annulés'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: this.projectColors,
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  categoryChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: this.categoryColors,
      borderColor: '#ffffff',
      borderWidth: 6,
      hoverOffset: 6
    }]
  };

  evolutionChartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'projets',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.35,
        fill: false
      },
      {
        data: [],
        label: 'employés',
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.12)',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#0ea5e9',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.35,
        fill: false
      }
    ]
  };

  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}`
        }
      }
    }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}`
        }
      }
    }
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: '#2563eb',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        grid: { color: '#eef2f7' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#eef2f7' },
        ticks: { color: '#94a3b8', precision: 0 }
      }
    }
  };

  constructor(
    private employeService: EmployeService,
    private projetService: ProjetService,
    private categorieService: CategorieService,
    private affectationService: AffectationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.failedSources = [];

    forkJoin({
      employes: this.safeGet('employés', this.employeService.GetAllEmployes()),
      projets: this.safeGet('projets', this.projetService.GetAllProjets()),
      categories: this.safeGet('catégories', this.categorieService.GetAllCategories()),
      affectations: this.safeGet('affectations', this.affectationService.GetAllAffectations())
    }).subscribe({
      next: ({ employes, projets, categories, affectations }) => {
        this.employes = employes;
        this.projets = projets;
        this.categories = categories;
        this.affectations = affectations;

        this.buildStats();
        this.buildProjectChart();
        this.buildCategoryChart();
        this.buildEvolutionChart();
        this.buildRecentActivities();
        if (this.failedSources.length) {
          this.errorMessage = "Données non chargées : " + this.failedSources.join(", ") + ". Appliquez le correctif backend inclus, redémarrez Spring Boot puis reconnectez-vous.";
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données du dashboard depuis le backend.';
        this.loading = false;
      }
    });
  }

  private safeGet<T>(label: string, request$: Observable<T[]>): Observable<T[]> {
    return request$.pipe(
      catchError((error) => {
        this.failedSources.push(label);
        console.error('Erreur chargement dashboard admin - ' + label, error);
        return of([] as T[]);
      })
    );
  }

  private buildStats(): void {
    this.totalEmployes = this.employes.length;
    this.projetsActifs = this.projets.filter((projet) => this.getProjectStatus(projet) === 'En cours').length;
    this.totalCategories = this.categories.length;

    const assignedEmployeIds = new Set<number>();
    this.affectations.forEach((affectation) => {
      const employeId = this.getAffectationEmployeId(affectation);
      if (employeId !== null) {
        assignedEmployeIds.add(employeId);
      }
    });

    this.tauxAffectation = this.totalEmployes > 0
      ? Math.round((assignedEmployeIds.size / this.totalEmployes) * 100)
      : 0;

    this.statCards = [
      {
        label: 'Total Employés',
        value: this.totalEmployes,
        detail: '+ données BD',
        icon: 'users',
        tone: 'blue',
        route: '/members'
      },
      {
        label: 'Projets Actifs',
        value: this.projetsActifs,
        detail: `${this.projets.length} projets au total`,
        icon: 'folder',
        tone: 'cyan',
        route: '/projets'
      },
      {
        label: 'Catégories',
        value: this.totalCategories,
        detail: 'Spécialités actives',
        icon: 'activity',
        tone: 'violet',
        route: '/categories'
      },
      {
        label: 'Taux d’affectation',
        value: `${this.tauxAffectation}%`,
        detail: this.tauxAffectation >= 70 ? 'Excellent' : 'À améliorer',
        icon: 'trend',
        tone: 'teal',
        route: '/projets'
      }
    ];
  }

  private buildProjectChart(): void {
    const counts: Record<ProjectStatus, number> = {
      'En cours': 0,
      'Terminés': 0,
      'En attente': 0,
      'Annulés': 0
    };

    this.projets.forEach((projet) => {
      counts[this.getProjectStatus(projet)] += 1;
    });

    const labels = Object.keys(counts) as ProjectStatus[];
    const values = labels.map((label) => counts[label]);

    this.projectLegend = labels.map((label, index) => ({
      label,
      value: counts[label],
      color: this.projectColors[index]
    }));

    this.projectChartData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: this.projectColors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  private buildCategoryChart(): void {
    const categoryNameById = new Map<number, string>();
    const counts = new Map<string, number>();

    this.categories.forEach((categorie) => {
      if (categorie.id !== undefined && categorie.id !== null) {
        categoryNameById.set(Number(categorie.id), categorie.nom);
      }
      counts.set(categorie.nom, 0);
    });

    this.employes.forEach((employe) => {
      const categoryName = this.getEmployeCategoryName(employe, categoryNameById);
      counts.set(categoryName, (counts.get(categoryName) || 0) + 1);
    });

    if (counts.size === 0) {
      counts.set('Sans catégorie', 0);
    }

    const labels = Array.from(counts.keys());
    const values = Array.from(counts.values());
    const colors = labels.map((_, index) => this.categoryColors[index % this.categoryColors.length]);

    this.categoryLegend = labels.map((label, index) => ({
      label,
      value: values[index],
      color: colors[index]
    }));

    this.categoryChartData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 6,
        hoverOffset: 6
      }]
    };
  }

  private buildEvolutionChart(): void {
    const months = this.getLastSixMonths();

    const projectValues = months.map((month) =>
      this.projets.filter((projet) => this.isDateRangeActiveInMonth(projet.dateDebut, projet.dateFin, month.start, month.end)).length
    );

    const employeeValues = months.map((month) => {
      const activeEmployeeIds = new Set<number>();
      this.affectations.forEach((affectation) => {
        if (this.isDateRangeActiveInMonth(affectation.dateDebut, affectation.dateFin, month.start, month.end)) {
          const employeId = this.getAffectationEmployeId(affectation);
          if (employeId !== null) {
            activeEmployeeIds.add(employeId);
          }
        }
      });

      return activeEmployeeIds.size || this.totalEmployes;
    });

    this.evolutionChartData = {
      labels: months.map((month) => month.label),
      datasets: [
        {
          ...this.evolutionChartData.datasets[0],
          data: projectValues
        },
        {
          ...this.evolutionChartData.datasets[1],
          data: employeeValues
        }
      ]
    };
  }

  private buildRecentActivities(): void {
    const activities: ActivityItem[] = [];

    this.employes.forEach((employe: any) => {
      activities.push({
        title: 'Employé enregistré',
        subtitle: this.formatEmployeName(employe),
        time: this.formatRelativeDate(this.getItemDate(employe)),
        color: '#3b82f6',
        sortDate: this.getItemDate(employe)
      });
    });

    this.projets.forEach((projet: any) => {
      const status = this.getProjectStatus(projet);
      activities.push({
        title: status === 'Terminés' ? 'Projet terminé' : 'Projet enregistré',
        subtitle: projet.nom || 'Projet sans nom',
        time: this.formatRelativeDate(this.getItemDate(projet, projet.dateDebut || projet.dateFin)),
        color: '#0ea5e9',
        sortDate: this.getItemDate(projet, projet.dateDebut || projet.dateFin)
      });
    });

    this.affectations.forEach((affectation: any) => {
      activities.push({
        title: 'Affectation enregistrée',
        subtitle: this.formatAffectationLabel(affectation),
        time: this.formatRelativeDate(this.getItemDate(affectation, affectation.dateDebut)),
        color: '#6366f1',
        sortDate: this.getItemDate(affectation, affectation.dateDebut)
      });
    });

    this.categories.forEach((categorie: any) => {
      activities.push({
        title: 'Catégorie enregistrée',
        subtitle: categorie.nom || 'Catégorie sans nom',
        time: this.formatRelativeDate(this.getItemDate(categorie)),
        color: '#06b6d4',
        sortDate: this.getItemDate(categorie)
      });
    });

    this.recentActivities = activities
      .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
      .slice(0, 4);
  }

  private getProjectStatus(projet: any): ProjectStatus {
    const rawStatus = String(projet.statut || projet.status || projet.etat || '').toLowerCase();

    if (rawStatus.includes('annul') || rawStatus.includes('cancel')) {
      return 'Annulés';
    }

    if (rawStatus.includes('termin') || rawStatus.includes('fini') || rawStatus.includes('done') || rawStatus.includes('complete')) {
      return 'Terminés';
    }

    if (rawStatus.includes('attente') || rawStatus.includes('pending') || rawStatus.includes('plan')) {
      return 'En attente';
    }

    const today = this.stripTime(new Date());
    const startDate = this.parseDate(projet.dateDebut);
    const endDate = this.parseDate(projet.dateFin);

    if (startDate && startDate > today) {
      return 'En attente';
    }

    if (endDate && endDate < today) {
      return 'Terminés';
    }

    return 'En cours';
  }

  private getEmployeCategoryName(employe: any, categoryNameById: Map<number, string>): string {
    if (employe.categorie?.nom) {
      return employe.categorie.nom;
    }

    if (employe.categorieNom) {
      return employe.categorieNom;
    }

    const categoryId = this.toNumber(employe.categorieId || employe.idCategorie || employe.categorie?.id);
    if (categoryId !== null && categoryNameById.has(categoryId)) {
      return categoryNameById.get(categoryId) || 'Sans catégorie';
    }

    return 'Sans catégorie';
  }

  private getAffectationEmployeId(affectation: any): number | null {
    return this.toNumber(affectation.employeId || affectation.idEmploye || affectation.employe?.id);
  }

  private getAffectationProjetId(affectation: any): number | null {
    return this.toNumber(affectation.projetId || affectation.idProjet || affectation.projet?.id);
  }

  private formatAffectationLabel(affectation: any): string {
    let employeeName = [affectation.employePrenom, affectation.employeNom].filter(Boolean).join(' ');

    if (!employeeName && affectation.employe) {
      employeeName = [affectation.employe.prenom, affectation.employe.nom].filter(Boolean).join(' ');
    }

    const projectName = affectation.projetNom || affectation.projet?.nom || this.getProjectNameById(this.getAffectationProjetId(affectation));
    return `${employeeName || 'Employé'} → ${projectName || 'Projet'}`;
  }
  private getProjectNameById(projectId: number | null): string {
    if (projectId === null) {
      return '';
    }

    return this.projets.find((projet) => Number(projet.id) === projectId)?.nom || '';
  }

  private formatEmployeName(employe: any): string {
    return [employe.prenom, employe.nom].filter(Boolean).join(' ') || employe.email || 'Employé';
  }

  private getLastSixMonths(): Array<{ label: string; start: Date; end: Date }> {
    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const months: Array<{ label: string; start: Date; end: Date }> = [];
    const now = new Date();

    for (let index = 5; index >= 0; index--) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = formatter.format(date).replace('.', '');
      months.push({ label: label.charAt(0).toUpperCase() + label.slice(1), start, end });
    }

    return months;
  }

  private isDateRangeActiveInMonth(startDateValue: any, endDateValue: any, monthStart: Date, monthEnd: Date): boolean {
    const startDate = this.parseDate(startDateValue) || new Date(1900, 0, 1);
    const endDate = this.parseDate(endDateValue) || new Date(2999, 11, 31);
    return startDate <= monthEnd && endDate >= monthStart;
  }

  private getItemDate(item: any, fallbackDate?: any): Date {
    return this.parseDate(item.createdAt)
      || this.parseDate(item.dateCreation)
      || this.parseDate(item.created_at)
      || this.parseDate(fallbackDate)
      || new Date(0);
  }

  private formatRelativeDate(date: Date): string {
    if (!date || date.getTime() === 0) {
      return 'Depuis la BD';
    }

    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      return 'Il y a moins d’1h';
    }

    if (diffMs < day) {
      return `Il y a ${Math.max(1, Math.round(diffMs / hour))}h`;
    }

    const days = Math.max(1, Math.round(diffMs / day));
    return days === 1 ? 'Il y a 1j' : `Il y a ${days}j`;
  }

  private parseDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return this.stripTime(date);
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toNumber(value: any): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }
}
