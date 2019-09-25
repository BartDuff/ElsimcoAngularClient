import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MissionModel} from '../models/mission.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userSubject = new Subject<any[]>();

  private users = [];

  emitUserSubject() {
    this.userSubject.next(this.users.slice());
  }

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${API_URL}/users`);
  }

  addUser(newUser: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/users/`, newUser, { headers: headers});
  }

  editUser(updatedUser: UserModel): Observable<UserModel> {
    return this.http.put<UserModel>(`${API_URL}/users/${updatedUser.id}`, updatedUser);
  }

  getUser(idRecherche: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${API_URL}/users/${idRecherche}`);
  }

  deleteUser(user: UserModel): Observable<any> {
    const idASupprimer = user.id;
    return this.http.delete(`${API_URL}/users/${idASupprimer}`);
  }

  addMissionInterestToUser(user: UserModel, mission: MissionModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/users/${user.id}/missions`, mission, { headers: headers});
  }

  removeMissionInterestFromUser(user: UserModel, mission: MissionModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.delete(`${API_URL}/users/${user.id}/missions/${mission.id}`, { headers: headers});
  }

  getMissionInterestsForUser(user: UserModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get(`${API_URL}/users/${user.id}/missions`, { headers: headers});
  }

  getFicheForUser(user: UserModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get(`${API_URL}/users/${user.id}/fiches`, { headers: headers});
  }

  getCongeForUser(user: UserModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get(`${API_URL}/users/${user.id}/conges`, { headers: headers});
  }
}
