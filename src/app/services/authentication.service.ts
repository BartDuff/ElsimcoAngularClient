import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {UserModel} from '../models/user.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  currentUserSubject = new Subject<UserModel>();
  currentUser: UserModel;
  constructor(private http: HttpClient) { }

  emitCurrentUserSubject() {
    this.currentUserSubject.next(this.currentUser);
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders(credentials ? {
      Authorization : 'Basic ' + btoa(credentials.email + ':' + credentials.password)
    } : {});
    return this.http.get<any>(`${API_URL}/users/authenticate`, { headers: headers, withCredentials: true});
  }

  logout():Observable<any> {
    const headers = new HttpHeaders(localStorage.getItem("token") ? {
      Authorization : 'Basic ' + localStorage.getItem("token")
    } : {});
    // remove user from local storage to log user out

    return this.http.get(`${API_URL}/users/logout`, { headers: headers, withCredentials: true});
  }
}
