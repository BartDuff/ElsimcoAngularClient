import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/news';
    //this.authService.logout();
  }

}
