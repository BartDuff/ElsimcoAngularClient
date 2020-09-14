import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DocumentModel} from '../models/document.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {DocscandidatModel} from '../models/docscandidat.model';
import {ImageModel} from '../models/image.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DocscandidatService {

  docscandidatSubject = new Subject<any[]>();

  private docscandidats = [];

  emitDocumentSubject() {
    this.docscandidatSubject.next(this.docscandidats.slice());
  }

  constructor(private http: HttpClient) { }

  getDocsCandidats(): Observable<DocscandidatModel[]> {
    return this.http.get<DocscandidatModel[]>(`${API_URL}/docscandidats`, { withCredentials : true});
  }

  editDocsCandidat(updatedDocument: DocscandidatModel): Observable<DocscandidatModel> {
    return this.http.put<DocscandidatModel>(`${API_URL}/docscandidats/${updatedDocument.id}`, updatedDocument);
  }

  getDocsCandidat(idRecherche: string): Observable<DocscandidatModel> {
    return this.http.get<DocscandidatModel>(`${API_URL}/docscandidats/${idRecherche}`);
  }

  deleteDocsCandidat(document: DocscandidatModel): Observable<any> {
    const idASupprimer = document.id;
    return this.http.delete(`${API_URL}/docscandidats/${idASupprimer}`);
  }

  // downloadDocsCandidat(document: DocscandidatModel) {
  //   return this.http.get(`${API_URL}/docscandidats/download?=${document.name}`, {responseType: 'arraybuffer'});
  // }

  uploadDocument(document: DocscandidatModel):Observable<any> {
    return this.http.post(`${API_URL}/docscandidats`, document);
  }

  // sendDocumentByEmail(user:UserModel, document:DocumentModel) {
  //   return this.http.post(`${API_URL}/emails/${user.id}/${document.id}`, null);
  // }

  openDocsCandidat(idRecherche: string): Observable<DocscandidatModel> {
    return this.http.get<DocscandidatModel>(`${API_URL}/docscandidats/${idRecherche}/open`);
  }
}
