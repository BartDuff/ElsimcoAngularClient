import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  img = `/../../${environment.base}/assets/images/profile.png`;
  img_bgd = `../../${environment.base}/assets/images/179317.jpg`;
  currentUser: UserModel;
  @Input() user: UserModel;

  constructor(private userService: UserService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => this.user = data
      )
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }
}
