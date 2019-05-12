import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MissionModel} from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private apiUrl = 'http://localhost:9091/missions';
  missionSubject = new Subject<any[]>();

  private missions = [];

  emitMissionSubject() {
    this.missionSubject.next(this.missions.slice());
  }

  constructor(private http: HttpClient) { }

  getMissions(): Observable<MissionModel[]> {
    return this.http.get<MissionModel[]>(`${this.apiUrl}`);
  }

  addMission(newMission: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, newMission);
  }

  editMission(updatedMission: MissionModel): Observable<MissionModel> {
    return this.http.put<MissionModel>(`${this.apiUrl}/${updatedMission._id}`, updatedMission);
  }

  getMission(idRecherche: string): Observable<MissionModel> {
    return this.http.get<MissionModel>(`${this.apiUrl}/${idRecherche}`);
  }

  deleteMission(mission: MissionModel): Observable<any> {
    const idASupprimer = mission._id;
    return this.http.delete(`${this.apiUrl}/${idASupprimer}`);
  }
}
