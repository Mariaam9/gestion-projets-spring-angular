import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Projet } from '../Modeles/Projet';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  GetAllProjets(): Observable<Projet[]> {
    return this.httpClient.get<Projet[]>(`${this.apiUrl}/admin/projets`);
  }

  GetProjetById(id: number): Observable<Projet> {
    return this.httpClient.get<Projet>(`${this.apiUrl}/admin/projets/${id}`);
  }

  AddProjet(projet: Projet): Observable<Projet> {
    return this.httpClient.post<Projet>(`${this.apiUrl}/admin/projets`, projet);
  }

  UpdateProjet(id: number, projet: Projet): Observable<Projet> {
    return this.httpClient.put<Projet>(`${this.apiUrl}/admin/projets/${id}`, projet);
  }

  DeleteProjet(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/admin/projets/${id}`);
  }

  GetAllProjetsForEmploye(): Observable<Projet[]> {
    return this.httpClient.get<Projet[]>(`${this.apiUrl}/employe/projets`);
  }
}
