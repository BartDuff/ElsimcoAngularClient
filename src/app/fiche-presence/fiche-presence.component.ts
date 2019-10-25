import {Component, ChangeDetectorRef, OnInit, ViewChild, AfterViewChecked} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {DateAdapter, MatDateFormats, MatDialog, MatDialogConfig, MatMonthView} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {NgForm} from '@angular/forms';
import {PdfService} from '../services/pdf.service';
import {FicheModel} from '../models/fiche.model';
import htmlToImage from 'html-to-image';
import {image} from 'html2canvas/dist/types/css/types/image';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {CommentFicheDialogComponent} from '../dialog/comment-fiche-dialog/comment-fiche-dialog.component';

@Component({
  selector: 'app-fiche-presence',
  templateUrl: './fiche-presence.component.html',
  styleUrls: ['./fiche-presence.component.css']
})
export class FichePresenceComponent implements OnInit, AfterViewChecked {

  @ViewChild('calendar') calendar: MatMonthView<Moment>;
  @ViewChild('f') f: NgForm;
  selectedDate: Moment;
  mouseDown:boolean = false;
  joursDeLaSemaine = ['L','M','M','J','V','S','D'];
  daysOff = [];
  nomsDesMois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] ;
  absTypes= ["RTT", "Congés payés", "Absence exceptionnelle", "Congé sans solde", "Arrêt maladie", "Formation", "Intercontrat"];
  absences= ["RTT E","RTT S", "Congés payés", "Absence exceptionnelle", "Congé sans solde", "Arrêt maladie", "Formation", "Intercontrat"];
  absShortTypes= ["RTT", "CP", "C.E.", "C.S.S.", "A.M.", "F", "I"];
  dateNow : Date;
  FicheEnvoyee:boolean;
  daysOffSavedObjArr = [];
  currentUser:UserModel;

  getWeekday(date:Date){
     return date.getUTCDay();
  }

  creatArray(number){
     return new Array(number);
  }

  getAbsTypeShort(date, formval?) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return this.absShortTypes[this.absTypes.indexOf(x.typeConge)];
      }
    }
    return '';
  }

  getAbsTypeLong(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return x.typeConge;
      }
    }
    return '';
  }

  getAbsHalfDay(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        if (x.demiJournee) {
          return '1/2';
        }
      }
    }
    return '';
  }

  spliceDay(arr, date) {
    for (let x of arr) {
      if (x.date == date) {
        arr.splice(arr.indexOf(x), 1);
      }
    }
  }

  includesDay(arr, date) {
    for (let x of arr) {
      if (x.date == date) {
        return true;
      }
    }
    return false;
  }

  getDayColor(day) {
    if (this.checkWeekends(day)) {
      return 'grey';
    }
    if (this.checkDay(day)) {
      return 'orange';
    }
    if (this.checkAskedHolidays(day)) {
      for (let c of this.daysOffSavedObjArr) {
        if (c.date == moment(day).format('DD/MM/YYYY')) {
          if (c.valideRH) {
            return 'greenyellow';
          }
        }
      }
      return 'yellow';
    }
    return 'white';
  }

  getHolidays() {
    this.userService.getCongeForUser(this.currentUser).subscribe(
      (data) => {
        for (let d of data) {
          //this.mesConges.push(moment(d.date).format('DD/MM/YYYY').toString());
          if (d.valideRH){
            this.daysOffSavedObjArr.push(({
              date: moment(d.date).format('DD/MM/YYYY').toString(),
              typeConge: d.typeConge,
              demiJournee: d.demiJournee,
              typeDemiJournee: d.typeDemiJournee,
              valideRH: d.valideRH,
              commentaires: d.commentaires
            }));
          }
        }
        // for(let day of this.daysOffSavedObjArr){
        //   this.daysOff.push(day.date);
        // }
      }
    );
  }

  checkAskedHolidays(day: Date) {
    let d = moment(day).format('DD/MM/YYYY').toString();
    // console.log(this.mesConges.indexOf(d));
    // console.log(d);
    // console.log(this.mesConges);
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == d) {
        return true;
      }
    }
    return false;
    //return this.mesConges.indexOf(d) != -1;
  }

  addCells(){
     let d = this.getWeekday(moment().startOf('month').toDate());
     return d;
  }

  s(ss){
    return JSON.stringify(ss)
  }
  c(cc){
    console.log(cc)
  }
  constructor(private toastr: ToastrService, private cdRef:ChangeDetectorRef, private pdfService:PdfService, private userService:UserService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getFichesForUser();
    this.selectedDate = moment(new Date());
    this.dateNow = new Date();
    this.getHolidays();
    // this.dateFilter(this.dateNow);
  }

  getFichesForUser(){
    this.userService.getFicheForUser(this.currentUser).subscribe(
      (data) => {
        let fichesUser:FicheModel[] = data;
        if (fichesUser.find((x) => x.annee === this.dateNow.getFullYear() && x.mois === this.nomsDesMois[this.dateNow.getMonth()])){
          this.FicheEnvoyee = true;
        } else {
          this.FicheEnvoyee = false;
        }
      }
    );
  }

  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }



  // dateFilter(date: Date) {
  //   let day = date.getDay();
  //   let ferie = FichePresenceComponent.joursFeries(date.getFullYear()).filter((x) => x.getMonth() == date.getMonth());
  //   let isHoliday = false;
  //   for (let i=0; i<ferie.length;i++){
  //     if(ferie[i].getDate() == date.getDate()){
  //       isHoliday = true;
  //     }
  //   }
  //   let forbiddenDay = day === 0 || day === 6 || isHoliday;
  //   if(!forbiddenDay){
  //     FichePresenceComponent.joursOuvres++;
  //   }
  //   return !forbiddenDay;
  // }

checkDay(day){
  let d = moment(day).format('DD/MM/YYYY');
  return this.daysOff.includes(d)
}

checkWeekends(day:Date){
     let d = day.toLocaleString('fr-FR', {weekday: 'short'});
     return d === 'dim.' || d === 'sam.' || FichePresenceComponent.joursFeries(this.dateNow.getFullYear()).includes(moment(day).format('DD/MM/YYYY').toString());
}
  addRemoveDay(event) {
     if(this.checkWeekends(event) || this.checkAskedHolidays(event)){
        return;
     } else {
       this.selectedDate = event;
       let day = moment(event).format('DD/MM/YYYY');
       if (this.daysOff.includes(day) && !this.mouseDown) {
         this.daysOff.splice(this.daysOff.indexOf(day),1);
       } else if(this.daysOff.includes(day) && this.mouseDown){
         return;
       } else {
         this.daysOff.push(day);
         this.daysOff.sort()
       }
     }
  }

  getDaysInMonth(month, year) {
    var date = new Date(Date.UTC(year, month, 1));
    var days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  joursOuvres() {
    let jo = [];
    for(let d of this.getDaysInMonth(this.dateNow.getMonth(),this.dateNow.getFullYear())){
      if(!this.checkWeekends(d)){
        jo.push(d);
      }
    }
    return jo;
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
    const VendrediSaint = new Date(an, MoisPaques - 1, JourPaques - 2);
    const LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1);
    const Ascension = new Date(an, MoisPaques - 1, JourPaques + 39);
    const Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49);
    const LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50);
    let t = [JourAn, VendrediSaint, Paques, LundiPaques, FeteTravail, Victoire1945, Ascension, Pentecote, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel];
    let sDates = [];
    for(let i=0;i<t.length;i++){
      sDates.push(moment(t[i]).format('DD/MM/YYYY'));
    }
    return sDates;
  }

  toMomentFormat(date:Date){
    return moment(date).format('DD/MM/YYYY');
  }

  sendFiche(form: NgForm){
    let fiche = new FicheModel();
    let table = document.getElementById('calendrier');
    htmlToImage.toPng(table).then((image)=> {
      fiche.tableImg = image;
      fiche.annee = this.dateNow.getFullYear();
      fiche.mois = this.nomsDesMois[this.dateNow.getMonth()];
      fiche.absences = this.countSansSolde(form);
      fiche.conges = this.countConges(form);
      fiche.congesSansSolde = this.countSansSolde(form);
      fiche.formation = this.countFormation(form);
      fiche.intercontrat = this.countInterContrat(form);
      fiche.maladie = this.countMaladie(form);
      fiche.rtte = this.countRTTE(form);
      fiche.rtts = this.countRTTS(form);
      fiche.datePublication = new Date();
      fiche.user = JSON.parse(localStorage.getItem('currentUser'));
      fiche.joursOuvres = this.joursOuvres().length;
      fiche.joursTravailles = this.joursOuvres().length - this.countJoursNonTravailles(form);
      for (let key in form.value) {
        if (form.value.hasOwnProperty(key)) {
          if (key.endsWith(" comm")) {
            fiche.commentaires[form.value[key.substr(0, 10)] + " " + key.substr(0, 10)] = form.value[key];
          }
        }
      }
      for (let c of this.daysOffSavedObjArr) {
          if (c.commentaires != undefined && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()) {
            fiche.commentaires[c.typeConge + " " + c.date] = c.commentaires;
          }
        }
      fiche.uri = `${fiche.user.prenom}_${fiche.user.nom}_${fiche.user.trigramme}_${fiche.mois}${fiche.annee}.pdf`;
      fiche.valideRH = false;
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      const dialogRef = this.dialog.open(CommentFicheDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        (data) => {
          fiche.commentaireSup = data.commentaire;
          this.pdfService.sendFiche(fiche).subscribe(
            (data) => {
              this.toastr.success("Fiche de présence bien envoyée", 'Envoyé');
              this.getFichesForUser();
            })
        })
    });
  }

  countRTTE(form: NgForm) {
    let count = 0;
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + " boolean"];
        if (value === "RTT E") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  countRTTS(form: NgForm) {
    let count = 0;
    for(let c of this.daysOffSavedObjArr){
      if(c.typeConge == 'RTT' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()){
        if(c.demiJournee)
          count = count + 0.5;
        else
          count++;
      }
    }
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + " boolean"];
        if (value === "RTT S") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  countConges(form: NgForm) {
    let count = 0;
    for(let c of this.daysOffSavedObjArr){
      if(c.typeConge == 'Congés payés' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()){
        if(c.demiJournee)
          count = count + 0.5;
        else
          count++;
      }
    }
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + " boolean"];
        if (value === "Congés payés") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  countAbsences(form: NgForm) {
    let count = 0;
    for(let c of this.daysOffSavedObjArr){
      if(c.typeConge == 'Absence exceptionnelle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()){
        if(c.demiJournee)
          count = count + 0.5;
        else
          count++;
      }
    }
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + " boolean"];
        if (value === "Absence exceptionnelle") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  countSansSolde(form: NgForm) {
    let count = 0;
    for(let c of this.daysOffSavedObjArr){
      if(c.typeConge == 'Congé sans solde' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()){
        if(c.demiJournee)
          count = count + 0.5;
        else
          count++;
      }
    }
    for(let key in form.value){
      if(form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + " boolean"];
        if (value === "Congé sans solde") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
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
        let nextValue = form.value[key + " boolean"];
        if (value === "Arrêt maladie") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
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
        let nextValue = form.value[key + " boolean"];
        if (value === "Formation") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
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
        let nextValue = form.value[key + " boolean"];
        if (value === "Intercontrat") {
          if (nextValue){
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  countJoursNonTravailles(form: NgForm){
    return this.countAbsences(form) + this.countConges(form) + this.countFormation(form)+this.countInterContrat(form)
      +this.countMaladie(form) + this.countRTTE(form)+this.countRTTS(form)+this.countSansSolde(form);
  }
}
