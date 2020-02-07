import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CandidatModel} from '../models/candidat.model';
import {environment} from '../../environments/environment';
import {FicheModel} from '../models/fiche.model';
import {DocumentModel} from '../models/document.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FicheService {

  ficheSubject = new Subject<any[]>();

  private fiches = [];

  emitFicheSubject() {
    this.ficheSubject.next(this.fiches.slice());
  }

  constructor(private http: HttpClient) { }

  getFiches(): Observable<any> {
    return this.http.get<FicheModel[]>(`${API_URL}/fiches`);
  }

  addFiche(newFiche: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/fiches`, newFiche, { headers: headers});
  }

  editFiche(updateFiche: FicheModel): Observable<FicheModel> {
    return this.http.put<FicheModel>(`${API_URL}/fiches/${updateFiche.id}`, updateFiche);
  }

  getFiche(idRecherche: string): Observable<FicheModel> {
    return this.http.get<FicheModel>(`${API_URL}/fiches/${idRecherche}`);
  }

  deleteFiche(fiche: FicheModel): Observable<any> {
    const idASupprimer = fiche.id;
    return this.http.delete(`${API_URL}/fiches/${idASupprimer}`);
  }

  sendComment(fiche, comment: String): Observable<any> {
    return this.http.post(`${API_URL}/emails/${fiche.id}/comment`, comment);
  }
}
