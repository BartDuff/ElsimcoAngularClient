import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';

@Component({
  selector: 'app-mission-add',
  templateUrl: './mission-add.component.html',
  styleUrls: ['./mission-add.component.css']
})
export class MissionAddComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private missionService: MissionService) { }

  addForm: FormGroup;
  mission: MissionModel;

  get f() {
    return this.addForm.value;
  }

  ngOnInit() {

    this.addForm = this.formBuilder.group({
      intitule: ['', Validators.required],
      client: ['', Validators.required],
      resume: ['', Validators.required],
      duree: ['', Validators.required],
      jobDesc: ['', Validators.required]
    });

  }

  onSubmit() {
    this.missionService.addMission(this.addForm.value)
      .subscribe( data => {
        this.router.navigate(['missions']);
      });
  }
}
