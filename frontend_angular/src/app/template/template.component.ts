import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent {
  isCollapsed = false;
  currentPageTitle = 'Dashboard';
  currentPageSubtitle = 'Gérez votre équipe et vos projets';
  isProfileMenuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.updatePageContext(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isProfileMenuOpen = false;
        this.updatePageContext(event.urlAfterRedirects || event.url);
      });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  updatePageContext(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];

    if (cleanUrl.includes('/members/create')) {
      this.currentPageTitle = 'Nouvel employé';
      this.currentPageSubtitle = 'Créer un nouveau compte employé';
      return;
    }

    if (cleanUrl.includes('/members') && cleanUrl.includes('/edit')) {
      this.currentPageTitle = 'Modifier employé';
      this.currentPageSubtitle = 'Modifier les informations de l’employé';
      return;
    }

    if (cleanUrl.includes('/members')) {
      this.currentPageTitle = 'Employés';
      this.currentPageSubtitle = 'Gérez les employés enregistrés';
      return;
    }

    if (cleanUrl.includes('/projets/create')) {
      this.currentPageTitle = 'Nouveau projet';
      this.currentPageSubtitle = 'Créer un nouveau projet';
      return;
    }

    if (cleanUrl.includes('/projets') && cleanUrl.includes('/edit')) {
      this.currentPageTitle = 'Modifier projet';
      this.currentPageSubtitle = 'Modifier les informations du projet';
      return;
    }

    if (cleanUrl.includes('/projets') || cleanUrl.includes('/affectations')) {
      this.currentPageTitle = 'Projets';
      this.currentPageSubtitle = 'Gérez les projets et leurs affectations';
      return;
    }

    if (cleanUrl.includes('/categories/create')) {
      this.currentPageTitle = 'Nouvelle catégorie';
      this.currentPageSubtitle = 'Créer une nouvelle spécialité';
      return;
    }

    if (cleanUrl.includes('/categories') && cleanUrl.includes('/edit')) {
      this.currentPageTitle = 'Modifier catégorie';
      this.currentPageSubtitle = 'Modifier les informations de la catégorie';
      return;
    }

    if (cleanUrl.includes('/categories')) {
      this.currentPageTitle = 'Catégories';
      this.currentPageSubtitle = 'Gérez les spécialités et catégories';
      return;
    }

    this.currentPageTitle = 'Dashboard';
    this.currentPageSubtitle = 'Gérez votre équipe et vos projets';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'Utilisateur';
    }

    const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
    if (fullName) {
      return fullName;
    }

    return user.name || user.fullName || user.email || 'Utilisateur';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || user?.sub || 'utilisateur@gestionpro.com';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
