import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EmailModel} from '../models/email.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {SmsModel} from '../models/sms.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  payload = {
    "app_key": "UdPJY6NdrDf4zIliMGVu",
    "redirect_uri": "http://localhost:4200/"
  }



  constructor(private http: HttpClient) { }

  // addPushSubscriber(sub:any): any{
  //   return this.http.post('/api/notifications', sub);
  // }

  // addPushSubscriber(): Observable<any>{
  //   return this.http.get('https://api.pushed.co/1/oauth/index?client_id=UdPJY6NdrDf4zIliMGVu&redirect_uri=http://localhost:4200');
  // }

  sendSms(message: String,recipient: String): Observable<any> {
    let mess = new SmsModel();
    mess.message = message;
    mess.recipient = recipient;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/sms`, mess, {headers: headers});
  }

  sendSmsWithRange(message: String, recipient: String, range:any): Observable<any> {
    let mess = new SmsModel();
    mess.message = message;
    mess.recipient = recipient;
    mess.range = range;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/smsrange`, mess, {headers: headers});
  }

}
