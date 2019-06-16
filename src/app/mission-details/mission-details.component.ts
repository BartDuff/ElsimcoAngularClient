import {Component, Input, OnInit} from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {EmailDialogComponent} from '../dialog/email-dialog/email-dialog.component';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.component.html',
  styleUrls: ['./mission-details.component.css']
})
export class MissionDetailsComponent implements OnInit {

  @Input() mission: MissionModel;
  users: UserModel[];
  currentUser: UserModel;
  isFavorite: boolean;
  favorites: MissionModel[];

  constructor(private missionService: MissionService,
              private userService: UserService,
              private route: ActivatedRoute,
              private emailDialog: MatDialog) {
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.missionService.getMission(params['id']).subscribe(
        data => {
          this.mission = data;
          this.missionService.getUsersInterestedInMission(data).subscribe(
            (res) => this.users = res
          );
          this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
          this.getFavorites();
          this.markAsRead();
        }
      ));
  }

  markAsRead() {
    this.mission.lu = true;
    this.missionService.editMission(this.mission).subscribe(
      (data) => this.mission = data
    );
  }

  getFavorites() {
    this.userService.getMissionInterestsForUser(this.currentUser).subscribe(
      (data) => {
        this.favorites = data;
        this.isFavorite = this.favorites.find(x => x.id === this.mission.id) !== undefined;
      }
    );
  }

  sendByEmail() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.emailDialog.open(EmailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        if (data != undefined) {
          this.missionService.sendMissionByEmail(data.email, this.mission).subscribe(
            (data) => console.log(data)
          );
        }
      }
    );
  }

  addMissionToList() {
    this.userService.addMissionInterestToUser(this.currentUser, this.mission).subscribe(
      () => {
        this.getFavorites();
      }
    );
  }

  deleteMissionFromList() {
    this.userService.removeMissionInterestFromUser(this.currentUser, this.mission).subscribe(
      () => {
        this.getFavorites();
      }
    );
  }
}
