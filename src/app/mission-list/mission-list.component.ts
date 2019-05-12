import { Component, OnInit } from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {Observable} from 'rxjs';
import {MissionService} from '../services/mission.service';

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.css']
})
export class MissionListComponent implements OnInit {

  missions: Observable<MissionModel[]>;
  selectedMission: MissionModel;

  constructor(private missionService: MissionService) {
  }

  ngOnInit() {
    this.getMissions();
  }

  getMissions() {
    this.missions = this.missionService.getMissions();
  }

  selectMission(missionSelected: MissionModel) {
    this.selectedMission = missionSelected;
  }

  deleteMission(missionToDelete: MissionModel) {
    this.missionService.deleteMission(missionToDelete).subscribe(
      () => this.getMissions()
    );
  }
}
