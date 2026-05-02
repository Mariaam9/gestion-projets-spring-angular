import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Affectation } from '../Modeles/Affectation';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AffectationService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  GetAllAffectations(): Observable<Affectation[]> {
    return this.httpClient.get<Affectation[]>(`${this.apiUrl}/admin/affectations`);
  }

  GetAffectationsByProjet(projetId: number): Observable<Affectation[]> {
    return this.httpClient.get<Affectation[]>(`${this.apiUrl}/admin/affectations/projet/${projetId}`);
  }

  AddAffectation(affectation: Affectation): Observable<Affectation> {
    return this.httpClient.post<Affectation>(`${this.apiUrl}/admin/affectations`, affectation);
  }

  DeleteAffectation(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/admin/affectations/${id}`);
  }

  GetMesAffectations(): Observable<Affectation[]> {
    return this.httpClient.get<Affectation[]>(`${this.apiUrl}/employe/mes-projets`);
  }

  GetEmployesByProjetForEmploye(projetId: number): Observable<Affectation[]> {
    return this.httpClient.get<Affectation[]>(`${this.apiUrl}/employe/projets/${projetId}/employes`);
  }
}
