import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DocumentModel} from '../models/document.model';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  documentSubject = new Subject<any[]>();

  private documents = [];

  emitDocumentSubject() {
    this.documentSubject.next(this.documents.slice());
  }

  constructor(private http: HttpClient) { }

  getDocuments(): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${API_URL}/documents`, { withCredentials : true});
  }

  addDocument(newDocument: any): Observable<any> {
    return this.http.post(`${API_URL}/documents/`, newDocument);
  }

  editDocument(updatedDocument: DocumentModel): Observable<DocumentModel> {
    return this.http.put<DocumentModel>(`${API_URL}/documents/${updatedDocument.id}`, updatedDocument);
  }

  getDocument(idRecherche: string): Observable<DocumentModel> {
    return this.http.get<DocumentModel>(`${API_URL}/documents/${idRecherche}`);
  }

  deleteDocument(document: DocumentModel): Observable<any> {
    const idASupprimer = document.id;
    return this.http.delete(`${API_URL}/documents/${idASupprimer}`);
  }

  downloadDocument() {
    return this.http.get(`${API_URL}/documents/download`, {responseType: 'arraybuffer'});
  }
}
