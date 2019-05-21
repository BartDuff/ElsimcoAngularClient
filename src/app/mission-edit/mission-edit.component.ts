import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';

@Component({
  selector: 'app-mission-edit',
  templateUrl: './mission-edit.component.html',
  styleUrls: ['./mission-edit.component.css']
})
export class MissionEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private missionService: MissionService) { }

  editForm: FormGroup;
  mission: MissionModel;


  ngOnInit() {

    this.editForm = this.formBuilder.group({
      id : [],
      intitule: ['', Validators.required],
      client: ['', Validators.required],
      resume: ['', Validators.required],
      duree: ['', Validators.required],
      jobDesc: ['', Validators.required]
    });
    this.route.params.subscribe(
      params => this.missionService.getMission(params['id']).subscribe(
        data => {this.editForm.setValue(data);
        }
      )
    );
  }

  onSubmit() {
    this.missionService.editMission(this.editForm.value)
      .subscribe( data => {
        this.router.navigate(['missions']);
      });
  }
}
