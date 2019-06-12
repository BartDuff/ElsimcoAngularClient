import { Component, OnInit } from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {Observable} from 'rxjs';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.css']
})
export class MissionListComponent implements OnInit {

  missions: MissionModel[];
  archivedMission: MissionModel[];
  toggleArchives: boolean;
  currentUser: UserModel;
  selectedMission: MissionModel;

  constructor(private missionService: MissionService,
              private userService: UserService,
              private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.getMissions();
    this.getArchivedMissions();
    this.toggleArchives = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getMissions() {
    this.missionService.getMissions().subscribe(
      (data) => this.missions = data
    );
  }

  getArchivedMissions() {
    this.missionService.getMissions().subscribe(
      (data) => this.archivedMission = data.filter(x => x.status == 0)
    );
  }

  addMissionToList(addedMission: MissionModel) {
    this.userService.addMissionInterestToUser(JSON.parse(localStorage.getItem('currentUser')), addedMission).subscribe(
      () => {
        this.getMissions();
      }
    );
  }

  deleteMissionFromList(deletedMission: MissionModel){
    this.userService.removeMissionInterestFromUser(JSON.parse(localStorage.getItem('currentUser')), deletedMission).subscribe(
      () => {
        this.getMissions();
      }
    );
  }

  deleteMission(missionToDelete: MissionModel) {
    this.missionService.deleteMission(missionToDelete).subscribe(
      ()=> {
        this.missions.splice(this.missions.indexOf(missionToDelete), 1);
      }
    );
  }

  toggleArchivesClick() {
    this.toggleArchives = !this.toggleArchives;
  }
  toggleArchiveMission(missionToArchive: MissionModel) {
    if (missionToArchive.status == 1) {
      missionToArchive.status = 0;
    } else {
      missionToArchive.status = 1;
    }
    this.missionService.editMission(missionToArchive).subscribe(
      () => {
        if(missionToArchive.status == 1){
          this.archivedMission.splice(this.archivedMission.indexOf(missionToArchive),1)
          this.getMissions();
        } else {
          this.missions.splice(this.missions.indexOf(missionToArchive), 1);
          this.getArchivedMissions();
        }
      }
    )
  }
}
