import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfigurationService} from '../services/configuration.service';
import {ConfigurationModel} from '../models/configuration.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  configuration: ConfigurationModel;
  configurationForm: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private configurationService: ConfigurationService) { }

  ngOnInit() {
    this.configurationForm = this.formBuilder.group({
      id: [],
      incrementRTT: ['', Validators.required],
      incrementCP: ['', Validators.required],
      mailRH: ['', Validators.required],
      mailCommercial:[''],
      contactsFaq: [''],
      categoriesFaq: ['']
    });
    this.configurationService.getSingleConfiguration("1").subscribe(
      (data)=>{
        this.configuration = data;
        this.configurationForm.controls.incrementRTT.setValue(data.incrementRTT);
        this.configurationForm.controls.incrementCP.setValue(data.incrementCP);
        this.configurationForm.controls.mailRH.setValue(data.mailRH);
        this.configurationForm.controls.mailCommercial.setValue(data.mailCommercial);
      }
    )

  }

  addContactToList(cont){
    this.configuration.contactsFaq.push(cont);
  }

  addCategoryToList(cat){
    console.log(cat);
    this.configuration.categoriesFaq.push(cat);
  }

  onSubmit(){
    this.configuration = this.configurationForm.value;
    this.configurationService.editConfiguration(this.configuration).subscribe(
      ()=>{
        this.ngOnInit();
      }
    );
  }

}
