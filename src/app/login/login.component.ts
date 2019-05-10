import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isAuth: boolean;
  credentials: any;
  user: UserModel;
  userForm: FormGroup;

  constructor(public userService: UserService,
              public authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private route: Router) { }

  ngOnInit() {
    this.initializeForm();
    this.authenticationService.emitCredentials();
  }

  initializeForm() {
    this.userForm = this.formBuilder.group({
      login: ['', Validators.required],
      mdp: ['', Validators.required],
    });
  }

  login() {
    const formValues = this.userForm.value;
    this.credentials = {
      login: formValues.login,
      mdp: formValues.mdp
    };
    this.authenticationService.login(this.credentials).subscribe((result) => {
      this.user = result;
      this.authenticationService.currentUser = this.user;
      this.authenticationService.emitCredentials();
      this.route.navigate(['/missions']);
    });
  }
}
