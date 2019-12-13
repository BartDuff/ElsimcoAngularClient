import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserModel} from '../models/user.model';
import {MissionModel} from '../models/mission.model';
import {environment} from '../../environments/environment';
import {EmailModel} from '../models/email.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }

  sendMail(message: String, obj: String, recipient: String): Observable<any> {
    let mess = new EmailModel();
    mess.message = message;
    mess.obj = obj;
    mess.recipient = recipient;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails`, mess, {headers: headers});
  }

  sendMailWithRange(message: String, obj: String, recipient: String, range:any): Observable<any> {
    let mess = new EmailModel();
    mess.message = message;
    mess.obj = obj;
    mess.recipient = recipient;
    mess.range = range;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/range`, mess, {headers: headers});
  }

  sendMailWithRangeForFile(message: String, obj: String, recipient: String, range:any): Observable<any> {
    let mess = new EmailModel();
    mess.message = message;
    mess.obj = obj;
    mess.recipient = recipient;
    mess.range = range;
    const headers = new HttpHeaders ({'Content-Type': 'application/json'});
    return this.http.post(`${API_URL}/emails/missingfile`, mess, {headers: headers});
  }

}
