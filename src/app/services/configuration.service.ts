import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ContactModel} from '../models/contact.model';
import {FaqModel} from '../models/faq.model';
import {environment} from '../../environments/environment';
import {ConfigurationModel} from '../models/configuration.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private http: HttpClient) {
  }

  getConfiguration(): Observable<any> {
    return this.http.get<ConfigurationModel[]>(`${API_URL}/configuration`,{ withCredentials : true});
  }

  addConfiguration(newConfig: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/configuration`, newConfig, { headers: headers});
  }

  editConfiguration(updateConfig: ConfigurationModel): Observable<FaqModel> {
    return this.http.put<FaqModel>(`${API_URL}/configuration/${updateConfig.id}`, updateConfig);
  }

  getSingleConfiguration(idRecherche: String): Observable<ConfigurationModel> {
    return this.http.get<ConfigurationModel>(`${API_URL}/configuration/${idRecherche}`);
  }

  deleteConfiguration(config: ConfigurationModel): Observable<any> {
    const idASupprimer = config.id;
    return this.http.delete(`${API_URL}/configuration/${idASupprimer}`);
  }

}
