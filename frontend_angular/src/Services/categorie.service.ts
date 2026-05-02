import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environment';
import { Categorie } from '../Modeles/Categorie';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private readonly apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private httpClient: HttpClient) { }

  GetAllCategories(): Observable<Categorie[]> {
    return this.httpClient.get<Categorie[]>(this.apiUrl);
  }

  AddCategorie(categorie: Categorie): Observable<Categorie> {
    return this.httpClient.post<Categorie>(this.apiUrl, categorie);
  }

  UpdateCategorie(id: number, categorie: Categorie): Observable<Categorie> {
    return this.httpClient.put<Categorie>(`${this.apiUrl}/${id}`, categorie);
  }

  DeleteCategorie(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
