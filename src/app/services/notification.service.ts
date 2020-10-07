import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EmailModel} from '../models/email.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {SmsModel} from '../models/sms.model';
import {NotificationModel} from '../models/notification.model';
import {AuthenticationService} from './authentication.service';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  payload = {
    "app_key": "UdPJY6NdrDf4zIliMGVu",
    "redirect_uri": "http://localhost:4200/"
  }
  notifications;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  _userNotifications : Subject<NotificationModel[]> = new BehaviorSubject<NotificationModel[]>(this.notifications);

  constructor(private http: HttpClient,
              private authService: AuthenticationService) {
    if(this.currentUser){
      this.getMessages(this.currentUser).subscribe(
        (n)=> {
          console.log(this.currentUser);
          this.notifications = n;
          this._userNotifications.next(this.notifications.filter((h:NotificationModel) => !h.lu))
        }
      )
    }
  }

  // addPushSubscriber(sub:any): any{
  //   return this.http.post('/api/notifications', sub);
  // }

  // addPushSubscriber(): Observable<any>{
  //   return this.http.get('https://api.pushed.co/1/oauth/index?client_id=UdPJY6NdrDf4zIliMGVu&redirect_uri=http://localhost:4200');
  // }
  getMessages(user: UserModel):Observable<any[]>{
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get<any[]>(`${API_URL}/users/${user.id}/messagerie`, { headers: headers});
  }

  editNotification(notification: NotificationModel):Observable<any>{
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.put<any>(`${API_URL}/users/${notification.user.id}/messagerie`, notification, {headers: headers});
  }

  sendSms(message: String,recipient: String): Observable<any> {
    let mess = new SmsModel();
    mess.message = message;
    mess.recipient = recipient;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/sms`, mess, {headers: headers});
  }

  sendSmsWithNotif(message: String,recipient: String, recipientId: number, sujet: String): Observable<any> {
    let mess = new SmsModel();
    mess.message = message;
    mess.recipientId = recipientId;
    mess.recipient = recipient;
    mess.sujet = sujet;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/smsnotif`, mess, {headers: headers});
  }

  sendSmsWithRange(message: String, recipient: String, range:any, recipientId: number, sujet: String): Observable<any> {
    let mess = new SmsModel();
    mess.message = message;
    mess.recipientId = recipientId;
    mess.recipient = recipient;
    mess.range = range;
    mess.sujet = sujet;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/smsrange`, mess, {headers: headers});
  }


}
