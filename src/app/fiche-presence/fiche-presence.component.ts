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
import {AllowAnticipationDialogComponent} from '../dialog/allow-anticipation-dialog/allow-anticipation-dialog.component';
import {FicheService} from '../services/fiche.service';

@Component({
  selector: 'app-fiche-presence',
  templateUrl: './fiche-presence.component.html',
  styleUrls: ['./fiche-presence.component.css']
})
export class FichePresenceComponent implements OnInit, AfterViewChecked {

  @ViewChild('calendar') calendar: MatMonthView<Moment>;
  @ViewChild('f') f: NgForm;
  selectedDate: Moment;
  mouseDown: boolean = false;
  loading = true;
  sending = false;
  firstDateToastr;
  secondDateToastr;
  joursDeLaSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  daysOff = [];
  justifManquant = false;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  absTypes = ['RTT', 'Congés Payés', 'Absence Exceptionnelle', 'Congés Sans Solde', 'Arrêt Maladie', 'Formation', 'Intercontrat','Activité Partielle'];
  absences = ['RTT', 'Congés Payés', 'Absence Exceptionnelle', 'Congés Sans Solde', 'Arrêt Maladie', 'Formation', 'Intercontrat','Activité Partielle'];
  absShortTypes = ['RTT', 'CP', 'A.E.', 'C.S.S.', 'A.M.', 'F', 'I','A.P'];
  absTypes2 = ['En mission','Congés Sans Solde','Formation', 'Arrêt Maladie','Intercontrat','Activité Partielle'];
  absShortTypes2 = ['E.M','C.S.S.','F','A.M.','I','A.P'];
  dateNow: Date;
  FicheEnvoyee: boolean;
  daysOffSavedObjArr = [];
  dayoffPlage = [];
  currentUser: UserModel;
  plage: boolean = false;
  firstClick: boolean = false;
  firstDay;
  fiche = new FicheModel();
  addedMission = false;
  enMission = false;
  enIntercontrat = false;
  enActivitePartielle = false;
  options = [];
  selected = 'Intercontrat';

  getWeekday(date: Date) {
    return date.getUTCDay();
  }

  ScrollDown() {
    let el = document.getElementById('choice');
    el.scrollIntoView();
  }

  showHiddenMission() {
    let el = document.getElementById('hiddenMission');
    if (el.style.display == 'none') {
      el.style.display = 'inline-block';
      el.style.width = '20%';
      this.addedMission = true;
      this.toastr.info('Veuillez préciser la date de début de la 2ème mission en \'Commentaire général\' après avoir cliqué sur ENVOYER', null, {extendedTimeOut: 8000});
    } else {
      el.style.display = 'none';
      this.addedMission = false;
      this.fiche.numeroAffaire2 = '';
    }
  }

  countSelectedDays() {
    let count = 0;
    for (let el of this.daysOff) {
      if (this.isArray(el)) {
        count += el.length;
      } else {
        count += 1;
      }
    }
    if (count <= 1) {
      return count + ' jour sélectionné';
    } else {
      return count + ' jours sélectionnés';
    }
  }

  creatArray(number) {
    return new Array(number);
  }

  includesArray(arr, arr2) {
    for (let x of arr) {
      if (this.isArray(x)) {
        if (x[0].date == arr2[0].date && x[x.length - 1].date == arr2[arr2.length - 1].date) {
          return true;
        }
      }
    }
    return false;
  }

  getAbsTypeShort(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return this.absShortTypes[this.absTypes.indexOf(x.typeConge)];
      }
    }
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == date) {
            return this.absShortTypes[this.absTypes.indexOf(y.typeConge)];
          }
        }
      }
      if (x.date == date) {
        return this.absShortTypes[this.absTypes.indexOf(x.typeConge)];
      }
    }
    return '';
  }

  getAbsHalfType(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        if (x.demiJournee) {
          return x.typeDemiJournee;
        }
      }
    }
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == date) {
            if (x.demiJournee) {
              return x.typeDemiJournee;
            }
          }
        }
      }
      if (x.date == date) {
        if (x.demiJournee) {
          return x.typeDemiJournee;
        }
      }
    }
    return '';
  }

  getAbsOtherHalf(date){
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        if (x.demiJournee && x.typeConge2 && x.typeConge2 !='En mission') {
          let typeDem = '';
          if(x.typeDemiJournee == 'Matin'){
            typeDem = 'A.M';
          } else {
            typeDem = 'M'
          }
          return '1/2 ' + this.absShortTypes2[this.absTypes2.indexOf(x.typeConge2)] + ' ' + typeDem;
        }
      }
    }
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == date) {
            if (x.demiJournee && x.typeConge2 && x.typeConge2 !='En mission') {
              let typeDem = '';
              if(x.typeDemiJournee == 'Matin'){
                typeDem = 'A.M';
              } else {
                typeDem = 'M'
              }
              return '1/2 ' + this.absShortTypes2[this.absTypes2.indexOf(x.typeConge2)] + ' ' + typeDem;
            }
          }
        }
      }
      if (x.date == date) {
        if (x.demiJournee && x.typeConge2 && x.typeConge2 !='En mission') {
          let typeDem = '';
          if(x.typeDemiJournee == 'Matin'){
            typeDem = 'A.M';
          } else {
            typeDem = 'M'
          }
          return '1/2 ' + this.absShortTypes2[this.absTypes2.indexOf(x.typeConge2)] + ' ' + typeDem;
        }
      }
    }
    return '';
  }

  compare(a, b) {
    if (this.isArray(a) && this.isArray(b)) {
      let dateA = this.toDate(a[0].date);
      let dateB = this.toDate(b[0].date);
      return dateA.getTime() - dateB.getTime();
    }
    if (this.isArray(a) && !this.isArray(b)) {
      let dateA = this.toDate(a[0].date);
      let dateB = this.toDate(b.date);
      return dateA.getTime() - dateB.getTime();
    }
    if (!this.isArray(a) && this.isArray(b)) {
      let dateA = this.toDate(a.date);
      let dateB = this.toDate(b[0].date);
      return dateA.getTime() - dateB.getTime();
    }
    if (!this.isArray(a) && !this.isArray(b)) {
      let dateA = this.toDate(a.date);
      let dateB = this.toDate(b.date);
      return dateA.getTime() - dateB.getTime();
    }
  }

  getAbsTypeLong(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return x.typeConge;
      }
    }
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == date) {
            return this.absTypes[this.absTypes.indexOf(y.typeConge)];
          }
        }
      }
      if (x.date == date) {
        return this.absTypes[this.absTypes.indexOf(x.typeConge)];
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
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == date) {
            if (x.demiJournee) {
              return '1/2';
            }
          }
        }
      }
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
    if (this.plage && this.firstClick && moment(day).format('DD/MM/YYYY') == this.dayoffPlage[0].date) {
      return 'orange';
    }
    return 'white';
  }


  getHolidays() {
    this.userService.getCongeForUser(this.currentUser).subscribe(
      (data) => {
        for (let d of data) {
          //this.mesConges.push(moment(d.date).format('DD/MM/YYYY').toString());
          if (d.valideRH) {
            this.daysOffSavedObjArr.push(({
              date: moment(d.date).format('DD/MM/YYYY').toString(),
              typeConge: d.typeConge,
              typeConge2: d.typeConge2,
              demiJournee: d.demiJournee,
              typeDemiJournee: d.typeDemiJournee,
              valideRH: d.valideRH,
              commentaires: d.commentaires
            }));
          }
          if (d.typeConge == 'Absence Exceptionnelle' && !d.justificatifRecu) {
            this.justifManquant = true;
          }
        }
        this.loading = false;
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

  addCells() {
    let d = this.getWeekday(moment(this.dateNow).startOf('month').toDate());
    return d;
  }

  s(ss) {
    return JSON.stringify(ss);
  }

  c(cc) {
    console.log(cc);
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  constructor(private toastr: ToastrService, private cdRef: ChangeDetectorRef, private pdfService: PdfService, private userService: UserService, private ficheService: FicheService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getFichesForUser();
    this.selectedDate = moment(new Date());
    this.dateNow = new Date();
    this.dateNow.setDate(this.dateNow.getDate()-14);
    this.getHolidays();
    this.fiche.numeroAffaire1 = '';
    this.fiche.numeroAffaire2 = '';
    // this.dateFilter(this.dateNow);
  }

  showToastr() {
    if (!this.plage) {
      return;
    }
    this.toastr.toastrConfig.closeButton = true;
    this.toastr.toastrConfig.disableTimeOut = true;
    let firstToastr = this.toastr.info('Sélectionner la première date de la plage', 'Sélection de plages de dates');
    this.firstDateToastr = firstToastr.toastRef.componentInstance;
  }

  getFichesForUser() {
    this.userService.getFicheForUser(this.currentUser).subscribe(
      (data) => {
        let fichesUser: FicheModel[] = data;
        for(let f of data){
          if(this.options.indexOf(f.numeroAffaire1)==-1){
            this.options.push(f.numeroAffaire1)
          }
          if(this.options.indexOf(f.numeroAffaire2)==-1){
            this.options.push(f.numeroAffaire2)
          }
        }
        if (fichesUser.find((x) => x.annee === this.dateNow.getFullYear() && x.mois === this.nomsDesMois[this.dateNow.getMonth()])) {
          this.FicheEnvoyee = true;
        } else {
          this.FicheEnvoyee = false;
        }
      }
    );
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  autoFillTypeInPlage(absence, plageArr) {
    let ifrom = 0;
    for (let i = 0; i < plageArr.length; i++) {
      if (plageArr[i].date == absence.date) {
        //console.log("found "+date+ " at position "+ i)
        ifrom = i;
        //break
      }
    }
    for (; ifrom < plageArr.length; ifrom++) {
      plageArr[ifrom].typeConge = absence.typeConge;
      // this.decreaseCountNew(this.daysOffSelectedObjArr[ifrom]);
    }
    if (plageArr.length > 1) {
      this.toastr.warning('Le type d\'absence a été appliqué à toutes les dates de la plage sélectionnée du ' + plageArr[0].date + ' au ' + plageArr[plageArr.length - 1].date, 'Attention');
    }
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

  checkDay(day) {
    let d = moment(day).format('DD/MM/YYYY');
    for (let x of this.daysOff) {
      if (this.isArray(x)) {
        for (let y of x) {
          if (y.date == d) {
            return true;
          }
        }
      } else {
        if (x.date == d) {
          return true;
        }
      }
    }
    return false;
    //return this.daysOff.includes(d)
  }

  checkWeekends(day: Date) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    let dateDepart = new Date(this.currentUser.dateDepart);
    if(dateDepart.getFullYear() > 1970){
    return moment(day).isAfter(moment(this.currentUser.dateDepart).add(1,"day"));
    }
    return d === 'dim.' || d === 'sam.' || FichePresenceComponent.joursFeries(this.dateNow.getFullYear()).includes(moment(day).format('DD/MM/YYYY').toString()) || moment(day).isBefore(moment(this.currentUser.dateArrivee));
  }

  // addRemoveDay(event) {
  //    if(this.checkWeekends(event) || this.checkAskedHolidays(event)){
  //       return;
  //    } else {
  //      this.selectedDate = event;
  //      let day = moment(event).format('DD/MM/YYYY');
  //      if (this.daysOff.includes(day) && !this.mouseDown) {
  //        this.daysOff.splice(this.daysOff.indexOf(day),1);
  //      } else if(this.daysOff.includes(day) && this.mouseDown){
  //        return;
  //      } else {
  //        this.daysOff.push(day);
  //        this.daysOff.sort()
  //      }
  //    }
  // }

  toDate(s) {
    return new Date(s.substr(6, 4), s.substr(3, 2) - 1, s.substr(0, 2));
  }

  isArray(a) {
    return Array.isArray(a);
  }

  addRemoveDay(event) {
    if (this.checkAskedHolidays(event) || this.checkWeekends(event)) {
      return;
    }
    let day = moment(event).format('DD/MM/YYYY');
    if (this.plage && this.firstClick) {
      this.secondDateToastr.remove();
      this.toastr.toastrConfig.closeButton = false;
      this.toastr.toastrConfig.disableTimeOut = false;
      let stopDate = moment(event);
      let f = moment(this.firstDay);
      while (f.toDate() < stopDate.toDate()) {
        f.add(1, 'd');
        if (this.checkAskedHolidays(f.toDate()) || this.checkWeekends(f.toDate())) {
          continue;
        } else {
          this.dayoffPlage.push({
            date: f.format('DD/MM/YYYY'),
            typeConge: 'Intercontrat',
            typeConge2: '',
            demiJournee: false,
            typeDemiJournee: '',
            commentaires: '',
            valideRH: false,
            typeCe: '',
            documentJointUri: '',
            documentJointType: '',
            rawFile: null,
            plage: true
          });
          this.dayoffPlage.sort((a, b) => this.compare(a, b));
        }
      }
      for (let dp of this.dayoffPlage) {
        if (this.includesDay(this.daysOff, moment(dp).format('DD/MM/YYYY'))) {
          this.toastr.error('Cette plage contient un jour déjà selectionné. Veuillez faire une nouvelle sélection', 'Erreur de sélection');
          this.firstDay = null;
          this.firstClick = false;
          this.plage = false;
          this.dayoffPlage = [];
          return;
        }
      }
      if (this.includesArray(this.daysOff, this.dayoffPlage)) {
        this.daysOff.splice(this.daysOff.indexOf(this.dayoffPlage), 1);
        this.firstDay = null;
        this.firstClick = false;
        this.plage = false;
        this.dayoffPlage = [];
        return;
      }
      if (this.firstDay.format('DD/MM/YYYY') == stopDate.format('DD/MM/YYYY')) {
        for (let arr of this.daysOff) {
          if (this.isArray(arr)) {
            if (this.includesDay(arr, day)) {
              this.toastr.error('Cette date est déjà contenue dans une plage', 'Erreur de sélection');
              this.firstDay = null;
              this.firstClick = false;
              this.plage = false;
              this.dayoffPlage = [];
              return;
            }
          }
        }
        this.daysOff.push({
          date: day,
          typeConge: 'Intercontrat',
          typeConge2: '',
          demiJournee: false,
          typeDemiJournee: '',
          commentaires: '',
          valideRH: false,
          typeCe: '',
          documentJointUri: '',
          documentJointType: '',
          rawFile: null,
          plage: false
        });
        this.daysOff.sort((a, b) => this.compare(a, b));
        this.firstDay = null;
        this.firstClick = false;
        this.plage = false;
        this.dayoffPlage = [];
        return;
      }
      for (let dayArr of this.daysOff) {
        if (this.isArray(dayArr)) {
          if (this.includesDay(dayArr, this.firstDay.format('DD/MM/YYYY'))) {
            let lastday = moment(this.toDate(dayArr[dayArr.length - 1].date));
            if (lastday.toDate().getDate() == stopDate.toDate().getDate()) {
              this.toastr.error('Ces dates sont déjà contenues dans une plage', 'Erreur de sélection');
              this.firstDay = null;
              this.firstClick = false;
              this.plage = false;
              this.dayoffPlage = [];
              return;
            }
            while (lastday.toDate() < stopDate.toDate()) {
              lastday.add(1, 'd');
              if (this.checkAskedHolidays(lastday.toDate()) || this.checkWeekends(lastday.toDate())) {
                continue;
              } else {
                dayArr.push({
                  date: lastday.format('DD/MM/YYYY'),
                  typeConge: 'Intercontrat',
                  typeConge2: '',
                  demiJournee: false,
                  typeDemiJournee: '',
                  commentaires: '',
                  valideRH: false,
                  typeCe: '',
                  documentJointUri: '',
                  documentJointType: '',
                  rawFile: null,
                  plage: true
                });
                this.autoFillTypeInPlage(dayArr[0], dayArr);
                dayArr.sort((a, b) => this.compare(a, b));
              }
            }
            this.firstDay = null;
            this.firstClick = false;
            this.plage = false;
            this.dayoffPlage = [];
            return;
          }
          if (this.includesDay(dayArr, stopDate.format('DD/MM/YYYY'))) {
            let firstArrDay = moment(this.toDate(dayArr[0].date));
            while (firstArrDay.toDate() > this.firstDay.toDate()) {
              firstArrDay.subtract(1, 'd');
              if (this.checkAskedHolidays(firstArrDay.toDate()) || this.checkWeekends(firstArrDay.toDate())) {
                continue;
              } else {
                dayArr.push({
                  date: firstArrDay.format('DD/MM/YYYY'),
                  typeConge: 'Intercontrat',
                  typeConge2: '',
                  demiJournee: false,
                  typeDemiJournee: '',
                  commentaires: '',
                  valideRH: false,
                  typeCe: '',
                  documentJointUri: '',
                  documentJointType: '',
                  rawFile: null,
                  plage: true
                });
                this.autoFillTypeInPlage(dayArr[0], dayArr);
                dayArr.sort((a, b) => this.compare(a, b));
              }
            }
            this.firstDay = null;
            this.firstClick = false;
            this.plage = false;
            this.dayoffPlage = [];
            return;
          }
        }
      }
      this.daysOff.push(this.dayoffPlage);
      this.daysOff.sort((a, b) => this.compare(a, b));
      this.firstDay = null;
      this.firstClick = false;
      this.plage = false;
      this.dayoffPlage = [];
      return;
    }
    if (this.plage && !this.firstClick) {
      this.firstDateToastr.remove();
      let secondToastr = this.toastr.info('Sélectionner la dernière date de la plage', 'Sélection de plages de dates');
      this.secondDateToastr = secondToastr.toastRef.componentInstance;
      this.firstClick = true;
      this.firstDay = moment(event);
      this.dayoffPlage.push({
        date: day,
        typeConge: 'Intercontrat',
        typeConge2: '',
        demiJournee: false,
        typeDemiJournee: '',
        commentaires: '',
        valideRH: false,
        typeCe: '',
        documentJointUri: '',
        documentJointType: '',
        rawFile: null,
        plage: true
      });
      this.dayoffPlage.sort((a, b) => this.compare(a, b));
      return;
    }
    for (let plageArr of this.daysOff) {
      if (this.isArray(plageArr)) {
        if (this.includesDay(plageArr, day)) {
          if (day == plageArr[0].date) {
            this.daysOff.splice(this.daysOff.indexOf(plageArr), 1);
          } else {
            plageArr.splice(plageArr.findIndex(item => item.date === day) + 1);
          }
          return;
        }
      }
    }
    if (this.includesDay(this.daysOff, day) && !this.mouseDown) {
      this.spliceDay(this.daysOff, day);
    } else if (this.includesDay(this.daysOff, day) && this.mouseDown) {
      return;
    } else {
      //this.daysOff.push(day);
      this.daysOff.push({
        date: day,
        typeConge: 'Intercontrat',
        typeConge2: '',
        demiJournee: false,
        typeDemiJournee: '',
        commentaires: '',
        valideRH: false,
        typeCe: '',
        documentJointUri: '',
        documentJointType: '',
        rawFile: null,
        plage: false
      });
      this.daysOff.sort((a, b) => this.compare(a, b));
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
    for (let d of this.getDaysInMonth(this.dateNow.getMonth(), this.dateNow.getFullYear())) {
      if (!this.checkWeekends(d)) {
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

  toMomentFormat(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  sendFiche(form: NgForm) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(CommentFicheDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.sending = true;
          let fiche = new FicheModel();
          let table = document.getElementById('capture');
          htmlToImage.toPng(table).then((image) => {
            fiche.tableImg = image;
            fiche.numeroAffaire1 = this.fiche.numeroAffaire1;
            fiche.numeroAffaire2 = this.fiche.numeroAffaire2;
            fiche.annee = this.dateNow.getFullYear();
            fiche.mois = this.nomsDesMois[this.dateNow.getMonth()];
            fiche.absences = this.countAbsences(form);
            fiche.conges = this.countConges(form);
            fiche.congesSansSolde = this.countSansSolde(form);
            fiche.formation = this.countFormation(form);
            fiche.intercontrat = this.countInterContrat(form);
            fiche.maladie = this.countMaladie(form);
            fiche.activitePartielle = this.countActivitePartielle(form);
            // fiche.rtte = this.countRTTE(form);
            // fiche.rtts = this.countRTTS(form);
            fiche.rtts = this.countRTT();
            fiche.datePublication = new Date();
            fiche.user = JSON.parse(localStorage.getItem('currentUser'));
            fiche.joursOuvres = this.joursOuvres().length;
            fiche.joursTravailles = this.joursOuvres().length - this.countJoursNonTravailles(form);
            // for (let key in form.value) {
            //   if (form.value.hasOwnProperty(key)) {
            //     if (key.endsWith(" comm")) {
            //       fiche.commentaires[form.value[key.substr(0, 10)] + " " + key.substr(0, 10)] = form.value[key];
            //     }
            //   }
            // }
            for (let c of this.daysOff) {
              if (this.isArray(c)) {
                if (c[0].commentaires != undefined) {
                  for (let cong of c) {
                    fiche.commentaires[cong.typeConge + ' ' + cong.date] = c[0].commentaires;
                  }
                }
              } else {
                if (c.commentaires != undefined && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
                  let dem = c.demiJournee ? '1/2 ' : '';
                  let typeDem = c.typeDemiJournee? ' ' + c.typeDemiJournee: '';
                  fiche.commentaires[dem + c.typeConge + typeDem + ' ' + c.date] = c.commentaires;
                }
              }
            }
            for (let c of this.daysOffSavedObjArr) {
              if (c.commentaires != undefined && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
                let dem = c.demiJournee ? '1/2 ' : '';
                let typeDem = c.typeDemiJournee? ' ' + c.typeDemiJournee : '';
                let typeDemiJournee2 = !c.typeDemiJournee?'':c.typeDemiJournee == 'Matin'?' Après-midi':' Matin';
                let typeDem2 = typeDemiJournee2? ' ' + typeDemiJournee2 : '';
                fiche.commentaires[dem + c.typeConge + typeDem +' '+ c.date] = c.commentaires;
                if(c.typeConge2){
                  fiche.commentaires[dem + c.typeConge2+ typeDemiJournee2 +' '+ c.date] = c.commentaires;
                }
              }
            }
            fiche.uri = `${fiche.user.prenom}_${fiche.user.nom}_${fiche.user.trigramme}_${fiche.mois}${fiche.annee}.pdf`;
            fiche.valideRH = false;
            fiche.commentaireSup = data.commentaire;
            console.log(fiche);
            this.pdfService.sendFiche(fiche).subscribe(
              (data) => {
                this.toastr.success('Fiche de présence bien envoyée', 'Envoyé');
                this.sending = false;
                this.getFichesForUser();
                this.ficheService.emitFicheSubject();
              });
          });
        }
      });
  }

  // countRTTE(form: NgForm) {
  //   let count = 0;
  //   for(let key in form.value){
  //     if(form.value.hasOwnProperty(key)) {
  //       let value = form.value[key];
  //       let nextValue = form.value[key + " boolean"];
  //       if (value === "RTT E") {
  //         if (nextValue){
  //           count = count + 0.5;
  //         } else {
  //           count++;
  //         }
  //       }
  //     }
  //   }
  //   return count;
  // }

  // countRTTS(form: NgForm) {
  //   let count = 0;
  //   for(let c of this.daysOffSavedObjArr){
  //     if(c.typeConge == 'RTT' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth()==this.dateNow.getMonth()){
  //       if(c.demiJournee)
  //         count = count + 0.5;
  //       else
  //         count++;
  //     }
  //   }
  //   for(let key in form.value){
  //     if(form.value.hasOwnProperty(key)) {
  //       let value = form.value[key];
  //       let nextValue = form.value[key + " boolean"];
  //       if (value === "RTT S") {
  //         if (nextValue){
  //           count = count + 0.5;
  //         } else {
  //           count++;
  //         }
  //       }
  //     }
  //   }
  //   return count;
  // }

  countRTT() {
    let count = 0;
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'RTT' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'RTT' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'RTT' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
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
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Congés Payés' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Congés Payés' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'Congés Payés' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Congés payés") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
  }

  countAbsences(form: NgForm) {
    let count = 0;
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Absence Exceptionnelle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Absence Exceptionnelle' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'Absence Exceptionnelle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Absence exceptionnelle") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
  }

  countSansSolde(form: NgForm) {
    let count = 0;
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Congés Sans Solde' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
      if (c.typeConge2 == 'Congés Sans Solde' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Congé sans solde") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Congés Sans Solde' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'Congés Sans Solde' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
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
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Arrêt maladie") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Arrêt Maladie' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
      if (c.typeConge2 == 'Arrêt Maladie' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Arrêt Maladie' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'Arrêt Maladie' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
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
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Formation") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Formation' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
      if (c.typeConge2 == 'Formation' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Formation' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
            }
          }
        }
      } else {
        if (c.typeConge == 'Formation' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
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
    let alreadyCountedHalf = [];
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Intercontrat") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Intercontrat' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
      if (c.typeConge2 == 'Intercontrat' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Intercontrat' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
              // let addHalf = this.daysOffSavedObjArr[this.daysOffSavedObjArr.findIndex(x => moment(this.toDate(x.date)).diff(moment(this.toDate(co.date)), 'days') == 1 && x.demiJournee)];
              // if (addHalf != undefined && alreadyCountedHalf.indexOf(addHalf) == -1) {
              //   count += 0.5;
              //   alreadyCountedHalf.push(addHalf);
              // }
            }
          }
        }
      } else {
        if (c.typeConge == 'Intercontrat' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
            count = count + 0.5;
          } else {
            count++;
            // let addHalf = this.daysOffSavedObjArr[this.daysOffSavedObjArr.findIndex(x => (moment(this.toDate(x.date)).diff(moment(this.toDate(c.date)), 'days') == 1 || moment(this.toDate(x.date)).diff(moment(this.toDate(c.date)), 'days') == -1) && x.demiJournee)];
            // if (addHalf != undefined && alreadyCountedHalf.indexOf(addHalf) == -1) {
            //   count += 0.5;
            //   alreadyCountedHalf.push(addHalf);
            // }
          }
        }
      }
    }
    return count;
  }

  countActivitePartielle(form: NgForm){
    let count = 0;
    let alreadyCountedHalf = [];
    // for(let key in form.value){
    //   if(form.value.hasOwnProperty(key)) {
    //     let value = form.value[key];
    //     let nextValue = form.value[key + " boolean"];
    //     if (value === "Intercontrat") {
    //       if (nextValue){
    //         count = count + 0.5;
    //       } else {
    //         count++;
    //       }
    //     }
    //   }
    // }
    for (let c of this.daysOffSavedObjArr) {
      if (c.typeConge == 'Activité Partielle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
      if (c.typeConge2 == 'Activité Partielle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
        if (c.demiJournee) {
          count = count + 0.5;
        } else {
          count++;
        }
      }
    }
    for (let c of this.daysOff) {
      if (this.isArray(c)) {
        for (let co of c) {
          if (co.typeConge == 'Activité Partielle' && new Date(Number(co.date.split('/')[2]), Number(co.date.split('/')[1]) - 1, Number(co.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
            if (co.demiJournee) {
              count = count + 0.5;
            } else {
              count++;
              // let addHalf = this.daysOffSavedObjArr[this.daysOffSavedObjArr.findIndex(x => moment(this.toDate(x.date)).diff(moment(this.toDate(co.date)), 'days') == 1 && x.demiJournee)];
              // if (addHalf != undefined && alreadyCountedHalf.indexOf(addHalf) == -1) {
              //   count += 0.5;
              //   alreadyCountedHalf.push(addHalf);
              // }
            }
          }
        }
      } else {
        if (c.typeConge == 'Activité Partielle' && new Date(Number(c.date.split('/')[2]), Number(c.date.split('/')[1]) - 1, Number(c.date.split('/')[0])).getMonth() == this.dateNow.getMonth()) {
          if (c.demiJournee) {
            count = count + 0.5;
          } else {
            count++;
            // let addHalf = this.daysOffSavedObjArr[this.daysOffSavedObjArr.findIndex(x => (moment(this.toDate(x.date)).diff(moment(this.toDate(c.date)), 'days') == 1 || moment(this.toDate(x.date)).diff(moment(this.toDate(c.date)), 'days') == -1) && x.demiJournee)];
            // if (addHalf != undefined && alreadyCountedHalf.indexOf(addHalf) == -1) {
            //   count += 0.5;
            //   alreadyCountedHalf.push(addHalf);
            // }
          }
        }
      }
    }
    return count;
  }

  countJoursNonTravailles(form: NgForm) {
    return this.countAbsences(form) + this.countConges(form) + this.countFormation(form) + this.countInterContrat(form) + + this.countActivitePartielle(form)
      + this.countMaladie(form) + this.countRTT() + this.countSansSolde(form);
  }
}
