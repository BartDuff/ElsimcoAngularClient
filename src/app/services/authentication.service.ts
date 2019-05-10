import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {UserModel} from '../models/user.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuth: boolean;
  isAdmin: boolean;
  isAdminChange: Subject<boolean> = new Subject<boolean>();
  isAuthChange: Subject<boolean> = new Subject<boolean>();
  currentUser: UserModel;
  isCurrentUser: Subject<UserModel> = new Subject<UserModel>();

  private apiLogin = '/login';
  private apiLogout = '/logout';
  constructor(private http: HttpClient) {
    this.currentUser = null;
    this.isAuth = false;
    this.isAdmin = false;
  }

  emitCredentials() {
    this.isAuthChange.next(this.isAuth);
    this.isCurrentUser.next(this.currentUser);
  }

  login(body: any): Observable<any> {
    this.isAuth = true;
    if (body.isAdmin) {this.isAdmin = true; }
    this.emitCredentials();
    return this.http.post(`${this.apiLogin}`, body);
  }

  logout() {
    this.isAuth = false;
    this.currentUser = null;
    this.emitCredentials();
    return this.http.get(`${this.apiLogout}`);
  }
}
