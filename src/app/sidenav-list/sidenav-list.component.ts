import {Component, EventEmitter, Injectable, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {FicheModel} from '../models/fiche.model';
import {FicheService} from '../services/fiche.service';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';
import {NotificationService} from '../services/notification.service';
import {MessageForumService} from '../services/message-forum.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class SidenavListComponent implements OnInit, OnDestroy {
  img = `../../${environment.base}/assets/images/elsimco-black.PNG`;
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  allRHUnvalidConges: CongeModel[];
  notifications;
  messagesForum;
  notificationsSubscription : Subscription;
  messagesForumSubscription : Subscription;
  token: any;
  allRHUnvalidFiches: FicheModel[];
  @Output() sidenavClose = new EventEmitter();
  constructor(private authService: AuthenticationService,
              private notificationService: NotificationService,
              private messageForumService: MessageForumService,
              private ficheService: FicheService,
              private congeService: CongeService,
              private router: Router) {
    this.currentUser = null;
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = localStorage.getItem('token');
        this.notificationsSubscription = this.notificationService._userNotifications.subscribe(
          (notifications)=> {
            this.notifications = notifications;
          }
        );
        this.messagesForumSubscription = this.messageForumService._forumMessages.subscribe(
          (messages)=> {
            this.messagesForum = messages;
          }
        );
      }
    );
    this.authService.emitCurrentUserSubject();
    this.getAllUnvalidRHFiches();
    this.getAllUnvalidRHConges();
  }

  public onSidenavClose = () => {
      this.sidenavClose.emit();
    };

  getAllUnvalidRHFiches() {
    this.ficheService.getFiches().subscribe(
      (data) => {
        this.allRHUnvalidFiches = data;
        this.allRHUnvalidFiches = this.allRHUnvalidFiches.filter(function (value) {
          return value.valideRH === false;
        })
      }
    );
  }

  getAllUnvalidRHConges() {
    this.congeService.getConges().subscribe(
      (data) => {
        this.allRHUnvalidConges = data;
        this.allRHUnvalidConges = this.allRHUnvalidConges.filter(function (value) {
          return value.valideRH === false;
        })
      }
    );
  }

  onLogout() {
    this.authService.logout().subscribe(
      ()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['login']).then(
          () => {
            console.log("Déconnecté");
            this.ngOnInit();
          });
      },
      ()=> {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['']).then(
          () => {
          }
        );
      }
    );
  }

  ngOnDestroy() {
    if(this.notificationsSubscription != null){
      this.notificationsSubscription.unsubscribe();
    }
  }

}
