import {AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {FicheService} from '../services/fiche.service';
import {FicheModel} from '../models/fiche.model';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit, AfterViewChecked {
  img = `../../${environment.base}/assets/images/elsimco-black.PNG`;
  allRHUnvalidFiches: FicheModel[];
  allRHValidFiches: FicheModel[];
  allRHUnvalidConges: CongeModel[];
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  token: any;
  notifications = ["Une nouvelles actualité a été publiée","Nouvelle demande de congés validée","Fiche de présence validée"];
  @Output() public sidenavToggle = new EventEmitter();

  constructor(private authService: AuthenticationService,
              private cdRef: ChangeDetectorRef,
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
      }
    );
    this.authService.emitCurrentUserSubject();
    this.getAllUnvalidRHFiches();
    this.getAllUnvalidRHConges();
    this.getAllValidRHFiches();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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
        this.cdRef.detectChanges();
      }
    );
  }

  getAllUnvalidRHFiches() {
    this.ficheService.getFiches().subscribe(
      (data) => {
        this.allRHUnvalidFiches = data;
        this.allRHUnvalidFiches = this.allRHUnvalidFiches.filter(function (value) {
          return value.valideRH === false;
        });
        this.cdRef.detectChanges();
      }
    );
  }

  getAllUnvalidRHConges() {
    this.congeService.getConges().subscribe(
      (data) => {
        this.allRHUnvalidConges = data;
        this.allRHUnvalidConges = this.allRHUnvalidConges.filter(function (value) {
          return value.valideRH === false;
        });
        this.cdRef.detectChanges();
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
