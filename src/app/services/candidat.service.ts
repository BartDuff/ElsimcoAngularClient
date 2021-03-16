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

  getCandidats(): any {
    return this.http.get<CandidatModel[]>(`${API_URL}/candidats`);
  }

  // getQCandidats(q, pageable, size): any {
  //   let s = "";
  //   for(let k of Object.keys(q))
  //     if(q[k])
  //       s+=(s.length > 0?'&':'')+k+"="+q[k];
  //
  //   s+=(s.length > 0?'&':'')+"page="+(pageable.number);
  //   s+=(s.length > 0?'&':'')+"size="+size;
  //   return this.http.get<CandidatModel[]>(`${API_URL}/candidats?${s}`);
  // }

  getQCandidats(q, pageable, size): any {
    let s = "";
    if(q['tags']){
      s+=(s.length > 0?'tags&':'')+"page="+(pageable.number);
      s+=(s.length > 0?'&':'')+"size="+size;
    }
      // s+=(s.length > 0?'&':'')+'tags'+"="+q['tags'];
    return this.http.get<CandidatModel[]>(`${API_URL}/candidats?${s}`);
  }

  addCandidat(newCandidat: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/candidats`, newCandidat, { headers: headers});
  }

  addCandidatNoMail(newCandidat: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/candidats/nomail`, newCandidat, { headers: headers});
  }

  editCandidat(updateCandidat: CandidatModel): Observable<CandidatModel> {
    return this.http.put<CandidatModel>(`${API_URL}/candidats/${updateCandidat.id}`, updateCandidat);
  }

  getCandidat(idRecherche: string): Observable<CandidatModel> {
    return this.http.get<CandidatModel>(`${API_URL}/candidats/${idRecherche}`);
  }

  deleteCandidat(candidat: CandidatModel): Observable<any> {
    const idASupprimer = candidat.id;
    return this.http.delete(`${API_URL}/candidats/${idASupprimer}`);
  }

  downloadFicheProcess(id: string): Observable<any> {
    return this.http.get(`${API_URL}/candidats/${id}/process`, { responseType: 'blob'});
  }

  downloadFicheRecrutement(id: string): Observable<any> {
    return this.http.get(`${API_URL}/candidats/${id}/recruitment`, { responseType: 'blob'});
  }

  downloadFicheProcessRecrutement(id: string): Observable<any> {
    return this.http.get(`${API_URL}/candidats/${id}/processrecruitment`, { responseType: 'blob'});
  }

}
