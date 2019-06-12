import {Component, Input, OnInit} from '@angular/core';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.component.html',
  styleUrls: ['./mission-details.component.css']
})
export class MissionDetailsComponent implements OnInit {

  @Input() mission: MissionModel;
  users:UserModel[];

  constructor(private missionService: MissionService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.missionService.getMission(params['id']).subscribe(
        data => {
          this.mission = data;
          this.missionService.getUsersInterestedInMission(data).subscribe(
            (res) => this.users = res
          )
        }
      ))
  }
}
