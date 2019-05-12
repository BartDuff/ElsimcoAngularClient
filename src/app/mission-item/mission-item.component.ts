import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';

@Component({
  selector: 'app-mission-item',
  templateUrl: './mission-item.component.html',
  styleUrls: ['./mission-item.component.css']
})
export class MissionItemComponent implements OnInit {

  missions: any[];
  missionSubscription: Subscription;
  @Input() mission: MissionModel;
  @Output() missionSelected = new EventEmitter<MissionModel>();
  @Output() missionDeleted = new EventEmitter<MissionModel>();

  lastUpdate = new Promise((resolve, reject) => {
    const date = new Date();
    setTimeout(
      () => {
        resolve(date);
      }, 2000
    );
  });

  constructor(private missionService: MissionService) { }

  ngOnInit() {
    this.missionSubscription = this.missionService.missionSubject.subscribe(
      (missions: any[]) => {
        this.missions = missions;
      }
    );
    this.missionService.emitMissionSubject();
  }


}
