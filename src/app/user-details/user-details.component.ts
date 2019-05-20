import {Component, Input, OnInit} from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  @Input() user: UserModel;

  constructor(private userService: UserService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => this.user = data
      )
    );
  }
}
