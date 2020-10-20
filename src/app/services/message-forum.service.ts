import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {MessageForumModel} from '../models/message-forum.model';
import {AuthenticationService} from './authentication.service';
import {NotificationModel} from '../models/notification.model';

const API_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class MessageForumService {
  messagesForum;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  messageSubject = new Subject<any[]>();
  _forumMessages : Subject<MessageForumModel[]> = new BehaviorSubject<MessageForumModel[]>(this.messagesForum);
  private messages = [];

  emitNewsSubject() {
    this.messageSubject.next(this.messages.slice());
  }

  constructor(private http: HttpClient) {
    if(this.currentUser){
      this.getMessages().subscribe(
        (n)=> {
          this.messagesForum = n;
          this._forumMessages.next(this.messagesForum.filter((h:MessageForumModel) => h.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1 && h.type == 'origin' && h.valideAdmin));
        }
      )
    }
  }

  getMessages(): Observable<MessageForumModel[]> {
    return this.http.get<MessageForumModel[]>(`${API_URL}/messagesforum`, { withCredentials : true});
  }

  getBesoins(): Observable<MessageForumModel[]> {
    return this.http.get<MessageForumModel[]>(`${API_URL}/messagesforum/besoins`, { withCredentials : true});
  }

  getExperiences(): Observable<MessageForumModel[]> {
    return this.http.get<MessageForumModel[]>(`${API_URL}/messagesforum/experiences`, { withCredentials : true});
  }

  getAfterworks(): Observable<MessageForumModel[]> {
    return this.http.get<MessageForumModel[]>(`${API_URL}/messagesforum/afterworks`, { withCredentials : true});
  }

  addMessage(message: any): Observable<any> {
    return this.http.post(`${API_URL}/messagesforum/`, message);
  }

  editMessage(updatedMessage: MessageForumModel): Observable<MessageForumModel> {
    return this.http.put<MessageForumModel>(`${API_URL}/messagesforum/${updatedMessage.id}`, updatedMessage);
  }

  editSimpleMessage(updatedMessage: MessageForumModel): Observable<MessageForumModel> {
    return this.http.put<MessageForumModel>(`${API_URL}/messagesforum/${updatedMessage.id}/simple`, updatedMessage);
  }

  getSingleMessage(idRecherche: string): Observable<MessageForumModel> {
    return this.http.get<MessageForumModel>(`${API_URL}/messagesforum/${idRecherche}`);
  }

  deleteMessage(message: MessageForumModel): Observable<any> {
    const idASupprimer = message.id;
    return this.http.delete(`${API_URL}/messagesforum/${idASupprimer}`);
  }

  getParticipantsForAfterwork(messageForumModel: MessageForumModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get(`${API_URL}/messagesforum/${messageForumModel.id}/participants`, { headers: headers});
  }

  addParticipationToUser(user: UserModel, messageForumModel: MessageForumModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/messagesforum/${messageForumModel.id}/participants`, user, { headers: headers});
  }

  removeParticipationFromUser(user: UserModel, messageForumModel: MessageForumModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.delete(`${API_URL}/messagesforum/${messageForumModel.id}/participants/${user.id}`, { headers: headers});
  }

}
