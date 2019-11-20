import {Component, OnInit} from '@angular/core';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';
import {FicheModel} from '../models/fiche.model';
import {ToastrService} from 'ngx-toastr';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-validation-conges',
  templateUrl: './validation-conges.component.html',
  styleUrls: ['./validation-conges.component.css']
})
export class ValidationCongesComponent implements OnInit {
  congesValides: CongeModel[];
  congesNonValides: CongeModel[];
  daysOffSavedObjArr;
  dateNow: Date;
  users: UserModel[] = [];
  selectedUser;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  joursDeLaSemaine = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  constructor(private congeService: CongeService,
              private userService: UserService,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.getNonValidatedConges();
    this.getValidatedConges();
    this.getUsers();
    this.dateNow = new Date();
    this.selectedUser = null;
  }

  getNonValidatedConges() {
    this.congesNonValides = [];
    if (this.selectedUser == null) {
      this.congeService.getConges().subscribe(
        (data) => {
          for (let c of data) {
            if (!c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth()) {
              this.congesNonValides.push(c);
            }
          }
        }
      );
    } else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (!c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth()) {
              this.congesNonValides.push(c);
            }
          }
        });
    }
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
      }
    )} else {
      this.userService.getCongeForUser(this.selectedUser).subscribe(
        (d) => {
          for (let c of d) {
            if (c.valideRH && new Date(c.date).getMonth() == this.dateNow.getMonth()) {
              this.congesValides.push(c);
            }
          }
        });
    }
  }

  validateCongeRH(conge: CongeModel) {
    conge.valideRH = true;
    this.congeService.editConge(conge).subscribe(
      (data) => {
        this.congesNonValides.splice(this.congesNonValides.indexOf(conge), 1);
        this.congesValides.push(conge);
        this.toastrService.success('Congé validé', 'Congé validé');
      }
    );
  }

  validateAllCongeRH() {
    for(let c of this.congesNonValides){
      c.valideRH = true;
      this.congeService.editConge(c).subscribe(
        (data) => {
          this.congesNonValides.splice(this.congesNonValides.indexOf(c), 1);
          this.congesValides.push(c)}
      );}
    this.toastrService.success('Congés validés', 'Congés validés');
  }

  refuseCongeRH(conge: CongeModel) {
    conge.valideRH = false;
    this.congeService.deleteConge(conge).subscribe(
      (data) => {
        this.congesNonValides.splice(this.congesNonValides.indexOf(conge), 1);
        this.toastrService.error('Congé refusé', 'Congé refusé');
      }
    );
  }

  getDaysInMonth(month, year) {
    let date = new Date(Date.UTC(year, month, 1));
    let days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => this.users = data
    );
  }

  getHolidays(user: UserModel) {
    this.userService.getCongeForUser(user).subscribe(
      (data) => {
        for (let d of data) {
          //this.mesConges.push(moment(d.date).format('DD/MM/YYYY').toString());
          this.daysOffSavedObjArr.push(({
            date: moment(d.date).format('DD/MM/YYYY').toString(),
            typeConge: d.typeConge,
            demiJournee: d.demiJournee,
            typeDemiJournee: d.typeDemiJournee,
            valideRH: d.valideRH
          }));
        }
      }
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

