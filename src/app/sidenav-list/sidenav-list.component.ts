import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {environment} from '../../environments/environment';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {FicheModel} from '../models/fiche.model';
import {FicheService} from '../services/fiche.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidenavListComponent implements OnInit {
  img = `../../${environment.base}/assets/images/elsimco-black.PNG`;
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  token: any;
  allRHUnvalidFiches: FicheModel[];
  @Output() sidenavClose = new EventEmitter();
  constructor(private authService: AuthenticationService,
              private ficheService: FicheService,
              private router: Router) {
    this.currentUser = null;
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = localStorage.getItem('token');
      }
    );
    this.authService.emitCurrentUserSubject();
    this.getAllUnvalidRHFiches();
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

}
