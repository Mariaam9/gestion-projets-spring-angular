import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

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
  selectedRole: 'ADMIN' | 'EMPLOYE' = 'ADMIN';
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

  selectRole(role: 'ADMIN' | 'EMPLOYE'): void {
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
      next: () => {
        this.loading = false;
        if (this.keepSignedIn) {
          localStorage.setItem('keepSignedIn', 'true');
        }
        this.redirect();
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

  private redirect(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard-employe']);
    }
  }
}
