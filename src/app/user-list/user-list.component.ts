import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: Observable<UserModel[]>;
  selectedUser: UserModel;
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.users = this.userService.getUsers();
  }

  selectUser(userSelected: UserModel) {
    this.selectedUser = userSelected;
  }

  deleteUser(userToDelete: UserModel) {
    this.userService.deleteUser(userToDelete).subscribe(
      () => this.getUsers()
    );
  }

}
