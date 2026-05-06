import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

type LoginRole = 'ADMIN' | 'EMPLOYE';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  keepSignedIn: boolean = false;
  selectedRole: LoginRole = 'ADMIN';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirect();
    }
  }

  selectRole(role: LoginRole): void {
    this.selectedRole = role;
    this.error = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        this.loading = false;

        const connectedRole = this.normalizeRole(
          response?.role ||
          response?.user?.role ||
          response?.utilisateur?.role ||
          this.getRoleFromToken(response?.token)
        );

        if (!connectedRole) {
          this.clearSession();
          this.error = 'Impossible de vérifier le rôle du compte';
          return;
        }

        if (connectedRole !== this.selectedRole) {
          this.clearSession();

          if (this.selectedRole === 'ADMIN' && connectedRole === 'EMPLOYE') {
            this.error = 'Ce compte est un compte employé. Veuillez utiliser la section Employé.';
            return;
          }

          if (this.selectedRole === 'EMPLOYE' && connectedRole === 'ADMIN') {
            this.error = 'Ce compte est un compte administrateur. Veuillez utiliser la section Admin.';
            return;
          }

          this.error = 'Le rôle du compte ne correspond pas à la section sélectionnée.';
          return;
        }

        if (this.keepSignedIn) {
          localStorage.setItem('keepSignedIn', 'true');
        }

        this.redirectByRole(connectedRole);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Email ou mot de passe invalide';
        this.loading = false;
      }
    });
  }

  socialLogin(provider: string): void {
    console.log(`Login with ${provider}`);
  }

  private normalizeRole(role: any): LoginRole | null {
    if (!role) {
      return null;
    }

    const normalized = String(role).toUpperCase().replace('ROLE_', '');

    if (normalized === 'ADMIN') {
      return 'ADMIN';
    }

    if (normalized === 'EMPLOYE' || normalized === 'EMPLOYEE') {
      return 'EMPLOYE';
    }

    return null;
  }

  private getRoleFromToken(token?: string): LoginRole | null {
    if (!token) {
      token = localStorage.getItem('token') || '';
    }

    if (!token || !token.includes('.')) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      return this.normalizeRole(
        decodedPayload?.role ||
        decodedPayload?.roles ||
        decodedPayload?.authorities
      );
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('keepSignedIn');

    if (typeof this.authService.logout === 'function') {
      this.authService.logout();
    }
  }

  private redirect(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard-employe']);
    }
  }

  private redirectByRole(role: LoginRole): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.router.navigate(['/dashboard-employe']);
  }
}