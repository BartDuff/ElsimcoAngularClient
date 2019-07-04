import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ContactModel} from '../models/contact.model';
import {CandidatModel} from '../models/candidat.model';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CandidatService {

  candidatSubject = new Subject<any[]>();

  private candidats = [];

  emitCandidatSubject() {
    this.candidatSubject.next(this.candidats.slice());
  }

  constructor(private http: HttpClient) { }

  getCandidats(): Observable<CandidatModel[]> {
    return this.http.get<CandidatModel[]>(`${API_URL}/candidats`);
  }

  addCandidat(newCandidat: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/candidats`, newCandidat, { headers: headers});
  }

  editCandidat(updateCandidat: CandidatModel): Observable<CandidatModel> {
    return this.http.put<CandidatModel>(`${API_URL}/candidats/${updateCandidat.id}`, updateCandidat);
  }

  getCandidant(idRecherche: string): Observable<CandidatModel> {
    return this.http.get<CandidatModel>(`${API_URL}/candidats/${idRecherche}`);
  }

  deleteCandidat(candidat: CandidatModel): Observable<any> {
    const idASupprimer = candidat.id;
    return this.http.delete(`${API_URL}/candidats/${idASupprimer}`);
  }

}
