import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private userService: UserService) { }

  editForm: FormGroup;
  user: UserModel;

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      id: [],
      email: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      role: ['', Validators.required]
    });
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {this.editForm.setValue(data);
        }
      )
    );

  }

  onSubmit() {
    this.userService.editUser(this.editForm.value)
      .subscribe( data => {
        this.router.navigate(['users']);
      });
  }
}
