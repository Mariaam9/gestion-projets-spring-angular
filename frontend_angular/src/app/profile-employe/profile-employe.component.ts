import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../Services/auth.service';
import { EmployeService } from '../../Services/employe.service';
import { Employe } from '../../Modeles/Employe';

@Component({
  selector: 'app-profile-employe',
  templateUrl: './profile-employe.component.html',
  styleUrls: ['./profile-employe.component.css']
})
export class ProfileEmployeComponent implements OnInit {
  currentUser: any = null;
  profil: Employe | null = null;

  loading = false;
  error = '';
  isSidebarCollapsed = false;
  isProfileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private employeService: EmployeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProfil();
  }

  loadProfil(): void {
    this.loading = true;
    this.error = '';

    this.employeService.GetProfil().pipe(
      catchError(() => {
        this.error = 'Impossible de charger votre profil depuis la base de données.';
        return of(null);
      })
    ).subscribe((profil) => {
      this.profil = profil;
      this.loading = false;
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  goToProjects(): void {
    this.isProfileMenuOpen = false;
    this.router.navigate(['/dashboard-employe']);
  }

  goToProfile(): void {
    this.isProfileMenuOpen = false;
    this.router.navigate(['/profile-employe']);
  }

  logout(): void {
    this.isProfileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserFullName(): string {
    const user = this.profil || this.currentUser;
    const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim();
    return fullName || 'Employé';
  }

  getUserEmail(): string {
    return this.profil?.email || this.currentUser?.email || 'email non disponible';
  }

  getCurrentUserInitials(): string {
    const user = this.profil || this.currentUser;
    return this.getInitials(user?.prenom, user?.nom);
  }

  getInitials(prenom?: string, nom?: string): string {
    const p = prenom?.trim().charAt(0) || '';
    const n = nom?.trim().charAt(0) || '';
    const initials = `${p}${n}`.toUpperCase();
    return initials || 'EM';
  }

  getCategorieLabel(): string {
    const user: any = this.profil || this.currentUser || {};

    return (
      user?.categorieNom ||
      user?.nomCategorie ||
      user?.categorie_name ||
      user?.categorie?.nom ||
      user?.categorie?.name ||
      user?.categorie ||
      'Non définie'
    );
  }

  getRoleLabel(): string {
    const role = String(this.profil?.role || this.currentUser?.role || 'EMPLOYE').toUpperCase();
    return role === 'ADMIN' ? 'Administrateur' : 'Employé';
  }

  getMatricule(): string {
    return (this.profil as any)?.matricule || (this.currentUser as any)?.matricule || 'Non défini';
  }
}
