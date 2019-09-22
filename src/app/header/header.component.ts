import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {FicheService} from '../services/fiche.service';
import {FicheModel} from '../models/fiche.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  img = `../../${environment.base}/assets/images/elsimco-black.PNG`;
  allRHUnvalidFiches: FicheModel[];
  allRHValidFiches: FicheModel[];
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  token: any;
  @Output() public sidenavToggle = new EventEmitter();

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
    this.getAllValidRHFiches();
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };


  getAllValidRHFiches() {
    this.ficheService.getFiches().subscribe(
      (data) => {
        this.allRHValidFiches = data;
        this.allRHValidFiches = this.allRHValidFiches.filter(function (value) {
          return value.valideRH === true;
        })
      }
    );
  }

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
