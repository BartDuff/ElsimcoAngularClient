import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {FicheModel} from '../models/fiche.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private http: HttpClient) { }

  sendFiche(newFiche: FicheModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type' : 'application/json; charset=utf-8'});
    return this.http.post(`${API_URL}/fiches`, newFiche, { headers: headers});
  }

  downloadFiche(id: string): Observable<any> {
    // const headers = new HttpHeaders({
    //   'Content-Type' : 'application/octet-stream'});
    return this.http.get(`${API_URL}/fiches/${id}`, { responseType: 'blob'});
  }

}
