import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {environment} from '../../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  img = `/../../${environment.base}/assets/images/home.svg`;
  credentials: any = {email: '', password: ''};
  loginForm: FormGroup;
  message: string;
  returnUrl: string;
  submitted: boolean;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              public authService: AuthenticationService) {
    // redirect to home if already logged in
    if (localStorage.getItem("currentUser")) {
      this.router.navigate(['']).then(() => console.log("Déjà connecté"));
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/news';
    //this.authService.logout();
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
        console.log(user);
        if (user) {
          // store user details and basic auth credentials in local storage
          localStorage.setItem('token', window.btoa(`${this.credentials.email}:${this.credentials.password}`));
          this.authService.currentUser = user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.authService.emitCurrentUserSubject();
          this.router.navigate([this.returnUrl]).then(
            ()=>console.log("Connecté")
          );
      }}, error => {
        console.log(error);
        this.message = error;
        this.router.navigate(['']).then(
          ()=> console.log(this.message)
        );
      });
    }
  }

}
