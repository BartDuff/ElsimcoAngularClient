import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
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
      authorization : 'Basic ' + btoa(credentials.email + ':' + credentials.password)
    } : {});
    return this.http.get<any>(`${API_URL}/users/authenticate`, { headers: headers});
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

}
