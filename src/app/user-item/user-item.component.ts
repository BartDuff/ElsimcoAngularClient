import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';

@Component({
  selector: 'tr[app-user-item]',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})
export class UserItemComponent implements OnInit {
  users: any[];
  currentUser: UserModel;
  userSubscription: Subscription;
  @Input() user: UserModel;
  @Output() userSelected = new EventEmitter<UserModel>();
  @Output() userDeleted = new EventEmitter<UserModel>();

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userSubscription = this.userService.userSubject.subscribe(
      (users: any[]) => {
        this.users = users;
      }
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userService.emitUserSubject();
  }

  selectUser() {
    this.userSelected.emit(this.user);
  }

  deleteUser() {
    this.userDeleted.emit(this.user);
  }

}
