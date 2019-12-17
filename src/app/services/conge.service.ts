import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FicheModel} from '../models/fiche.model';
import {CongeModel} from '../models/conge.model';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CongeService {

  congeSubject = new Subject<any[]>();

  private conges = [];

  emitCongeSubject(c) {
    this.congeSubject.next(c);
  }

  constructor(private http: HttpClient) { }

  getConges(): Observable<any> {
    return this.http.get<CongeModel[]>(`${API_URL}/conges`);
  }

  addConge(newConge: CongeModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/conges`, newConge, { headers: headers});
  }

  editConge(updateConge: CongeModel): Observable<CongeModel> {
    return this.http.put<CongeModel>(`${API_URL}/conges/${updateConge.id}`, updateConge);
  }

  editMultipleConge(updateConges: CongeModel[]): Observable<CongeModel[]> {
    return this.http.put<CongeModel[]>(`${API_URL}/conges`, updateConges);
  }

  sortConges(congesToSort: CongeModel[]): Observable<any> {
    return this.http.post<CongeModel[]>(`${API_URL}/conges/sorted`, congesToSort);
  }

  getConge(idRecherche: string): Observable<CongeModel> {
    return this.http.get<CongeModel>(`${API_URL}/conges/${idRecherche}`);
  }

  deleteConge(conge: CongeModel): Observable<any> {
    const idASupprimer = conge.id;
    return this.http.delete(`${API_URL}/conges/${idASupprimer}`);
  }

  deleteMultipleConge(conges: CongeModel[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: conges
    };
    return this.http.delete(`${API_URL}/conges`,options);
  }
}
