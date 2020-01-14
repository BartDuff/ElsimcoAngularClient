import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DocumentModel} from '../models/document.model';
import {environment} from '../../environments/environment';
import {UserModel} from '../models/user.model';
import {ResponseContentType} from '@angular/http';

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

  downloadDocument(document: DocumentModel) {
    return this.http.get(`${API_URL}/documents/download?=${document.originalFileName}`, {responseType: 'arraybuffer'});
  }

  uploadDocument(file: any, filename: String) {
    return this.http.post(`${API_URL}/documents`, {"fileBase64": file, "originalFileName": filename});
  }

  sendDocumentByEmail(user:UserModel, document:DocumentModel) {
    return this.http.post(`${API_URL}/emails/${user.id}/${document.id}`, null);
  }

  openDocument(idRecherche: string): Observable<DocumentModel> {
    return this.http.get<DocumentModel>(`${API_URL}/documents/${idRecherche}`);
  }
}
