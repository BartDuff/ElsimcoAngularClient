import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {ContactModel} from '../models/contact.model';
import {MissionModel} from '../models/mission.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  contactSubject = new Subject<any[]>();

  private contacts = [];

  emitContactSubject() {
    this.contactSubject.next(this.contacts.slice());
  }

  constructor(private http: HttpClient) { }

  getContacts(): Observable<ContactModel[]> {
    return this.http.get<ContactModel[]>(`${API_URL}/contacts`);
  }

  addContact(newContact: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/contacts`, newContact, { headers: headers});
  }

  editContact(updateContact: ContactModel): Observable<ContactModel> {
    return this.http.put<ContactModel>(`${API_URL}/contacts/${updateContact.id}`, updateContact);
  }

  getContact(idRecherche: string): Observable<ContactModel> {
    return this.http.get<ContactModel>(`${API_URL}/contacts/${idRecherche}`);
  }

  deleteContact(contact: ContactModel): Observable<any> {
    const idASupprimer = contact.id;
    return this.http.delete(`${API_URL}/contacts/${idASupprimer}`);
  }

  sendRejectionMail(recipient:String, contact: ContactModel) {
    return this.http.post(`${API_URL}/emails/rejection/${contact.id}`, recipient);
  }
}
