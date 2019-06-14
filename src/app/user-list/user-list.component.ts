import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserModel[];
  currentUser: UserModel;
  selectedUser: UserModel;

  constructor(private userService: UserService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getUsers();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => this.users = data
    );
  }

  selectUser(userSelected: UserModel) {
    this.selectedUser = userSelected;
  }

  deleteUser(userToDelete: UserModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.userService.deleteUser(userToDelete).subscribe(
            () => {
              this.users.splice(this.users.indexOf(userToDelete), 1);
            }
          );
        }
      });
  }
}
