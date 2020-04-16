import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ContactModel} from '../models/contact.model';
import {environment} from '../../environments/environment';
import {FaqModel} from '../models/faq.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(private http: HttpClient) {
  }

  getFaq(): Observable<any> {
    return this.http.get<FaqModel[]>(`${API_URL}/faq`,{ withCredentials : true});
  }

  addFaq(newFaq: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/faq`, newFaq, { headers: headers});
  }

  editFaq(updateFaq: FaqModel): Observable<FaqModel> {
    return this.http.put<FaqModel>(`${API_URL}/faq/${updateFaq.id}`, updateFaq);
  }

  getSingleFaq(idRecherche: String): Observable<FaqModel> {
    return this.http.get<FaqModel>(`${API_URL}/faq/${idRecherche}`);
  }

  deleteFaq(faq: FaqModel): Observable<any> {
    const idASupprimer = faq.id;
    return this.http.delete(`${API_URL}/faq/${idASupprimer}`);
  }

}
