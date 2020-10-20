import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {environment} from '../../environments/environment';
import { filter } from 'rxjs/operators';
import {NotificationService} from '../services/notification.service';
import {NotificationModel} from '../models/notification.model';
import {MessageForumService} from '../services/message-forum.service';
import {MessageForumModel} from '../models/message-forum.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  img = `/../../${environment.base}/assets/images/businessmen.png`;
  credentials: any = {email: '', password: ''};
  loginForm: FormGroup;
  message: string;
  returnUrl: string;
  submitted: boolean;
  mdpMes = "";

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private notificationService: NotificationService,
              private messageForumService:MessageForumService,
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

  showMessage(){
    if (this.mdpMes == ''){
      this.mdpMes = 'Consultez la fiche de configuration de votre messagerie Elsimco';
    } else {
      this.mdpMes = '';
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  showSpinner(){
    return localStorage.getItem('currentUser') !== null;
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
            ()=> {
              this.notificationService.getMessages(JSON.parse(localStorage.getItem('currentUser'))).subscribe(
                (notif)=> {
                  this.notificationService._userNotifications.next(notif.filter((h:NotificationModel) => !h.lu));
                }
              );
              this.messageForumService.getMessages().subscribe(
                (messages)=>{
                  this.messageForumService._forumMessages.next(messages.filter((h:MessageForumModel) => h.readByUserIds.split(',').indexOf(JSON.parse(localStorage.getItem('currentUser')).id.toString()) == -1 && h.type == 'origin' && h.valideAdmin));
                }
              )
            }
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
