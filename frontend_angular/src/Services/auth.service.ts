import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getCurrentUser(): any {
    const storedUser = this.readStoredUser();
    const tokenUser = this.getUserFromToken();

    if (!storedUser && !tokenUser) {
      return null;
    }

    return {
      ...(tokenUser || {}),
      ...(storedUser || {})
    };
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isAdmin(): boolean {
    const role = this.normalizeRole(this.getCurrentUser()?.role);
    return role === 'ADMIN';
  }

  isEmploye(): boolean {
    const role = this.normalizeRole(this.getCurrentUser()?.role);
    return role === 'EMPLOYE' || role === 'EMPLOYEE';
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response?.token) {
            localStorage.setItem('jwt_token', response.token);

            const tokenUser = this.decodeUserFromToken(response.token);
            const currentUser = {
              ...(tokenUser || {}),
              ...response,
              email: response.email || tokenUser?.email || email,
              role: response.role || tokenUser?.role
            };

            localStorage.setItem('current_user', JSON.stringify(currentUser));
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('keepSignedIn');
  }

  private readStoredUser(): any | null {
    const raw = localStorage.getItem('current_user');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem('current_user');
      return null;
    }
  }

  private getUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    return this.decodeUserFromToken(token);
  }

  private decodeUserFromToken(token: string): any | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return null;
    }

    const email = payload.email || payload.sub || payload.username || payload.user_name || '';
    const roleValue = payload.role || payload.authority || payload.roles || payload.scope || payload.scopes || '';
    const role = this.extractRole(roleValue);

    const fullName = payload.name || payload.fullName || payload.full_name || '';
    const nameParts = String(fullName).trim().split(/\s+/).filter(Boolean);

    return {
      id: payload.id || payload.userId || payload.user_id || payload.employeId || payload.employe_id,
      nom: payload.nom || payload.lastName || payload.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
      prenom: payload.prenom || payload.firstName || payload.given_name || (nameParts.length ? nameParts[0] : ''),
      email,
      role
    };
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private extractRole(value: any): string {
    if (Array.isArray(value)) {
      const role = value.find((item) => this.normalizeRole(item).includes('ADMIN')) || value[0];
      return this.normalizeRole(role);
    }

    const text = String(value || '').toUpperCase();
    if (text.includes('ADMIN')) {
      return 'ADMIN';
    }
    if (text.includes('EMPLOYE') || text.includes('EMPLOYEE')) {
      return 'EMPLOYE';
    }
    return this.normalizeRole(text);
  }

  private normalizeRole(value: any): string {
    return String(value || '')
      .toUpperCase()
      .replace('ROLE_', '')
      .trim();
  }
}
