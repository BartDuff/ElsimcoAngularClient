import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {MessageForumModel} from '../models/message-forum.model';

const API_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class MessageForumService {
  messageSubject = new Subject<any[]>();

  private messages = [];

  emitNewsSubject() {
    this.messageSubject.next(this.messages.slice());
  }

  constructor(private http: HttpClient) { }

  getMessages(): Observable<MessageForumModel[]> {
    return this.http.get<MessageForumModel[]>(`${API_URL}/messagesforum`, { withCredentials : true});
  }

  addMessage(message: any): Observable<any> {
    return this.http.post(`${API_URL}/messagesforum/`, message);
  }

  editMessage(updatedMessage: MessageForumModel): Observable<MessageForumModel> {
    return this.http.put<MessageForumModel>(`${API_URL}/messagesforum/${updatedMessage.id}`, updatedMessage);
  }

  getSingleMessage(idRecherche: string): Observable<MessageForumModel> {
    return this.http.get<MessageForumModel>(`${API_URL}/messagesforum/${idRecherche}`);
  }

  deleteMessage(message: MessageForumModel): Observable<any> {
    const idASupprimer = message.id;
    return this.http.delete(`${API_URL}/messagesforum/${idASupprimer}`);
  }

}
