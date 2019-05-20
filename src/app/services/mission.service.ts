import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MissionModel} from '../models/mission.model';
import {environment} from '../../environments/environment';


const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  missionSubject = new Subject<any[]>();

  private missions = [];

  emitMissionSubject() {
    this.missionSubject.next(this.missions.slice());
  }

  constructor(private http: HttpClient) { }

  getMissions(): Observable<MissionModel[]> {
    return this.http.get<MissionModel[]>(`${API_URL}/missions`, { withCredentials : true});
  }

  addMission(newMission: any): Observable<any> {
    return this.http.post(`${API_URL}/missions/`, newMission);
  }

  editMission(updatedMission: MissionModel): Observable<MissionModel> {
    return this.http.put<MissionModel>(`${API_URL}/missions/${updatedMission.id}`, updatedMission);
  }

  getMission(idRecherche: string): Observable<MissionModel> {
    return this.http.get<MissionModel>(`${API_URL}/missions/${idRecherche}`);
  }

  deleteMission(mission: MissionModel): Observable<any> {
    const idASupprimer = mission.id;
    return this.http.delete(`${API_URL}/missions/${idASupprimer}`);
  }
}
