import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CongeModel} from '../models/conge.model';
import {UserModel} from '../models/user.model';
import {CongeService} from '../services/conge.service';
import {UserService} from '../services/user.service';
import * as moment from 'moment';


@Component({
  selector: 'app-planning-conges',
  templateUrl: './planning-conges.component.html',
  styleUrls: ['./planning-conges.component.css']
})
export class PlanningCongesComponent implements OnInit {

  @ViewChild('planning') pRef: ElementRef;
  congesValides: CongeModel[];
  loading = true;
  lastCall1 = true;
  lastCall2 = true;
  dateNow: Date;
  daysInMonth;
  users: UserModel[] = [];
  selectedUser;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  joursDeLaSemaine = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  constructor(private congeService: CongeService,
              private userService: UserService) {
  }

  ngOnInit() {
    this.getValidatedConges();
    this.getUsers();
    this.dateNow = new Date();
    this.getDaysInMonth(this.dateNow.getMonth(),this.dateNow.getFullYear());
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || PlanningCongesComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  static joursFeries(an): String[] {
    const JourAn = new Date(an, 0, 1);
    const FeteTravail = new Date(an, 4, 1);
    const Victoire1945 = new Date(an, 4, 8);
    const FeteNationale = new Date(an, 6, 14);
    const Assomption = new Date(an, 7, 15);
    const Toussaint = new Date(an, 10, 1);
    const Armistice = new Date(an, 10, 11);
    const Noel = new Date(an, 11, 25);
    // const SaintEtienne = new Date(an, '11', '26');
    const G = an % 19;
    const C = Math.floor(an / 100);
    const H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11));
    const J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7;
    const L = I - J;
    const MoisPaques = 3 + Math.floor((L + 40) / 44);
    const JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4);
    const Paques = new Date(an, MoisPaques - 1, JourPaques);
    // const VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2);
    const LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1);
    const Ascension = new Date(an, MoisPaques - 1, JourPaques + 39);
    const Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49);
    const LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50);
    let t = [JourAn, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel];
    let sDates = [];
    for (let i = 0; i < t.length; i++) {
      sDates.push(moment(t[i]).format('DD/MM/YYYY'));
    }
    return sDates;
  }

  getValidatedConges() {
    this.congesValides = [];
    if (this.selectedUser == null) {
      this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if (c.valideRH && new Date(c.date).getMonth() === this.dateNow.getMonth()) {
              this.congesValides.push(c);
            }
          }
          this.congesValides = this.congesValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
          this.loading = false;
        }
      );
    } else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth()) {
              this.congesValides.push(c);
            }
          }
          this.congesValides = this.congesValides.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
        });
    }
  }

  getDaysInMonth(month, year) {
    let date = new Date(Date.UTC(year, month, 1));
    let days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    this.daysInMonth = days;
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => this.users = data
    );
  }

  checkAskedMorningHolidays(day, user: UserModel) {
    for (let x of this.congesValides) {
      if (new Date(x.date).toDateString() == day.toDateString() && x.user.id == user.id) {
        if (x.demiJournee && x.typeDemiJournee == 'Matin' || !x.demiJournee) {
          return true;
        }
      }
    }
    return false;
  }

  checkAskedAfternoonHolidays(day, user: UserModel) {
    for (let x of this.congesValides) {
      if (new Date(x.date).toDateString() == day.toDateString() && x.user.id == user.id) {
        if (x.demiJournee && x.typeDemiJournee == 'Après-midi' || !x.demiJournee) {
          return true;
        }
      }
    }
    return false;
  }
}
