import { Component, OnInit } from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {Observable} from 'rxjs';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.css']
})
export class MissionListComponent implements OnInit {

  missions: Observable<MissionModel[]>;
  selectedMission: MissionModel;

  constructor(private missionService: MissionService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.getMissions();
  }

  getMissions() {
    this.missions = this.missionService.getMissions();
  }

  addMissionToList(addedMission: MissionModel) {
    this.userService.addMissionInterestToUser(JSON.parse(localStorage.getItem('currentUser')), addedMission).subscribe(
      () => this.getMissions());
  }

  deleteMission(missionToDelete: MissionModel) {
    this.missionService.deleteMission(missionToDelete).subscribe(
      () => this.getMissions()
    );
  }
}
