import {Component, EventEmitter, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  token: any;

  constructor(private authService: AuthenticationService) {
    this.currentUser = null;
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = localStorage.getItem('token');
      }
    );
    this.authService.emitCurrentUserSubject();
  }

  onLogout() {
    this.authService.logout();
    location.reload(true);
  }
}
