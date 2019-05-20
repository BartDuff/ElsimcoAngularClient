import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials: any = {email: '', password: ''};
  loginForm: FormGroup;
  message: string;
  returnUrl: string;
  submitted: boolean;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              public authService: AuthenticationService) {
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/missions';
    this.authService.logout();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }


  login() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.credentials = { email: this.f.email.value, password: this.f.password.value }
      this.authService.login(this.credentials).subscribe(user => {
        // login successful if there's a user in the response
        if (user) {
          // store user details and basic auth credentials in local storage
          localStorage.setItem('token', window.btoa(`${this.credentials.email}:${this.credentials.password}`));
          this.authService.currentUser = user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.authService.emitCurrentUserSubject();
          this.router.navigate([this.returnUrl]);
      }}, error => {
        this.message = error;
      });
    }
  }

}
