import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {MatCalendar, MatMonthView} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {NgForm} from '@angular/forms';
import {a} from '@angular/core/src/render3';

@Component({
  selector: 'app-fiche-presence',
  templateUrl: './fiche-presence.component.html',
  styleUrls: ['./fiche-presence.component.css']
})
export class FichePresenceComponent implements OnInit {
  @ViewChild('calendar') calendar: MatMonthView<Moment>;
  @ViewChild('f') f: NgForm;
  selectedDate: Moment;
  daysOff = [];
  absences= ["RTT E", "RTT S", "Congés payés", "Absences exceptionnelle", "Congé sans solde", "Arrêt maladie", "Formation", "Intercontrat"];
  dateNow : Date;
  FicheEnvoyee:boolean = false;

  constructor(private toastr: ToastrService) {
  }

  ngOnInit() {
    this.selectedDate = moment(new Date(2019,6,10));
    this.dateNow = new Date();
    this.dateFilter(this.dateNow);
  }

  dateFilter(date: Date) {
    let day = date.getDay();
    let ferie = FichePresenceComponent.joursFeries(date.getFullYear()).filter((x) => x.getMonth() == date.getMonth());
    let isHoliday = false;
    for (let i=0; i<ferie.length;i++){
      if(ferie[i].getDate() == date.getDate()){
        isHoliday = true;
      }
    }
    let forbiddenDay = day === 0 || day === 6 || isHoliday;
    return !forbiddenDay;
  }

  addRemoveDay(event) {
    this.selectedDate = event;
    let day = moment(event).format('DD/MM/YYYY');
    if (this.daysOff.includes(day)){
      this.daysOff.splice(this.daysOff.indexOf(day),1);
    } else {
      this.daysOff.push(day);
      this.daysOff.sort()
    }
  }
   static joursFeries(an): Date[] {
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
    const VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2);
    const LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1);
    const Ascension = new Date(an, MoisPaques - 1, JourPaques + 39);
    const Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49);
    const LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50);
    return [JourAn, VendrediSaint, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel];
  }

  sendFiche(form: NgForm){
    this.toastr.success("Fiche de présence bien envoyée", 'Envoyé');
    this.FicheEnvoyee = true;
  }

  countRTTE(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "RTT E") {
          count++;
        }
      }
    }
    return count;
  }

  countRTTS(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "RTT S") {
          count++;
        }
      }
    }
    return count;
  }

  countConges(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Congés payés") {
          count++;
        }
      }
    }
    return count;
  }

  countAbsences(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Absences exceptionnelle") {
          count++;
        }
      }
    }
    return count;
  }

  countSansSolde(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Congé sans solde") {
          count++;
        }
      }
    }
    return count;
  }


  countMaladie(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Arrêt maladie") {
          count++;
        }
      }
    }
    return count;
  }

  countFormation(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Formation") {
          console.log(value);
        }
      }
    }
    return count;
  }

  countInterContrat(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        if (value === "Intercontrat") {
          console.log(value);
        }
      }
    }
    return count;
  }


}
