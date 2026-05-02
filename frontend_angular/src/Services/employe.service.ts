import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employe } from '../Modeles/Employe';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  GetAllEmployes(): Observable<Employe[]> {
    return this.httpClient.get<Employe[]>(`${this.apiUrl}/admin/employes`);
  }

  GetEmployeById(id: number): Observable<Employe> {
    return this.httpClient.get<Employe>(`${this.apiUrl}/admin/employes/${id}`);
  }

  AddEmploye(employe: any): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/admin/employes`, employe);
  }

  UpdateEmploye(id: number, employe: any): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/admin/employes/${id}`, employe);
  }

  DeleteEmploye(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/admin/employes/${id}`);
  }

  GetProfil(): Observable<Employe> {
    return this.httpClient.get<Employe>(`${this.apiUrl}/employe/profil`);
  }
}
