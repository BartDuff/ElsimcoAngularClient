import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';
import {Router} from '@angular/router';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';

@Component({
  selector: 'app-mission-item',
  templateUrl: './mission-item.component.html',
  styleUrls: ['./mission-item.component.css']
})
export class MissionItemComponent implements OnInit {

  missions: any[];
  missionSubscription: Subscription;
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  isFavorite: boolean;
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

  constructor(private missionService: MissionService,
              private userService: UserService,
              private authService: AuthenticationService,
              private router: Router) { }

  ngOnInit() {
    this.missionSubscription = this.missionService.missionSubject.subscribe(
      (missions: any[]) => {
        this.missions = missions;
      }
    );
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      }
    );
    this.authService.emitCurrentUserSubject();
    this.missionService.emitMissionSubject();
    this.isFavorite = this.currentUser.missions.find(x => x.id === this.mission.id) !== undefined;
  }

  deleteMission() {
    this.missionDeleted.emit(this.mission);
  }

  addMissionToList() {
    this.missionSelected.emit(this.mission);
  }

}
