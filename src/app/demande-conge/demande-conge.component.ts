import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatMonthView} from '@angular/material';
import {Moment} from 'moment';
import {NgForm} from '@angular/forms';
import {UserModel} from '../models/user.model';
import {ToastrService} from 'ngx-toastr';
import {PdfService} from '../services/pdf.service';
import {UserService} from '../services/user.service';
import {InputFileComponent, InputFileConfig} from 'ngx-input-file';
import {FicheModel} from '../models/fiche.model';
import htmlToImage from 'html-to-image';
import * as moment from 'moment';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';
import {xdescribe} from '@angular/core/testing/src/testing_internal';
import {CommentFicheDialogComponent} from '../dialog/comment-fiche-dialog/comment-fiche-dialog.component';
import {AllowAnticipationDialogComponent} from '../dialog/allow-anticipation-dialog/allow-anticipation-dialog.component';
import {forEach} from '@angular/router/src/utils/collection';
import {EmailService} from '../services/email.service';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {groupBy} from 'rxjs/operators';

const config: InputFileConfig = {
  fileAccept: '*',
  fileLimit: 1
};

@Component({
  selector: 'app-demande-conge',
  templateUrl: './demande-conge.component.html',
  styleUrls: ['./demande-conge.component.css']
})
export class DemandeCongeComponent implements OnInit, AfterViewChecked {

  @ViewChild('calendar') calendar: MatMonthView<Moment>;
  @ViewChild('f') f: NgForm;
  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  //selectedDate: Moment;
  allowAnticipation = false;
  mouseDown: boolean = false;
  rttValid = true;
  fileValid = true;
  joursDeLaSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  //daysOff = [];
  daysOffSelectedObjArr = [];
  daysOffSavedObjArr = [];
  dayoffPlage = [];
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  absTypes = ['RTT', 'Congés payés', 'Absence Exceptionnelle', 'Congé sans solde'];
  absShortTypes = ['RTT', 'CP', 'C.E.', 'C.S.S.'];
  dateNow: Date;
  FicheEnvoyee: boolean = false;
  currentUser: UserModel;
  selectedFiles;
  filename;
  fileEncoded;
  plage: boolean = false;
  firstClick: boolean = false;
  firstDay;


  getAbsTypeShort(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return this.absShortTypes[this.absTypes.indexOf(x.typeConge)];
      }
    }
    for (let x of this.daysOffSelectedObjArr) {
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
    for (let x of this.daysOffSelectedObjArr) {
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

  constructor(private toastr: ToastrService, private cdRef: ChangeDetectorRef, private pdfService: PdfService, private userService: UserService, private congeService: CongeService, private emailService: EmailService, private dialog: MatDialog) {
  }

  getDayColor(day, iteration) {
    if (this.checkWeekends(day, iteration)) {
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


  getWeekday(date: Date) {
    return date.getUTCDay();
  }

  creatArray(number) {
    return new Array(number);
  }

  getHolidaysOfMonth(mois) {
    let holidayMonthArr = [];
    for (let h of this.daysOffSavedObjArr) {
      if (moment(h.date, 'dd/MM/YYYY').month() == this.nomsDesMois.indexOf(mois)) {
        holidayMonthArr.push(h);
      }
    }
    holidayMonthArr.sort(function (a, b) {
      let dateA = moment(a.date).date();
      let dateB = moment(b.date).date();
      return dateA - dateB;
    });
    return holidayMonthArr;
  }

  addCells(number,iteration) {
    let d = this.getWeekday(new Date(this.dateNow.getFullYear()+iteration, number, 1));
    return d;
  }

  s(ss) {
    return JSON.stringify(ss, null, 4);
  }

  c(cc) {
    console.log(cc);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.selectedDate = moment(new Date());
    this.dateNow = new Date();
    this.FicheEnvoyee = null;
    this.getHolidays();
    // this.dateFilter(this.dateNow);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  // decreaseCount(absence) {
  //   if (absence.typeConge === 'Congés payés') {
  //     if (this.previousCount === 'RTT' && this.previousDate === absence.date && this.currentUser.rttn != 0) {
  //       if(absence.demiJournee)
  //         this.currentUser.rttn += 3.5;
  //       else
  //         this.currentUser.rttn +=7;
  //     }
  //     if (this.currentUser.cpNMoins1 > 0) {
  //       this.currentUser.cpNMoins1 -= 1;
  //     } else {
  //       this.toastr.error('Votre solde est insuffisant', 'Avertissement');
  //     }
  //     this.previousCount = 'Congés payés';
  //   }
  //   if (absence.typeConge === 'RTT') {
  //     if (this.previousCount === 'Congés payés' && this.previousDate === absence.date && this.currentUser.cpNMoins1 != 0) {
  //       this.currentUser.cpNMoins1 += 1;
  //     }
  //     if (this.currentUser.rttn >=3.5) {
  //       if(absence.demiJournee)
  //         this.currentUser.rttn -= 3.5;
  //       else
  //         this.currentUser.rttn -= 7;
  //     } else {
  //       this.toastr.error('Votre solde est insuffisant', 'Avertissement');
  //     }
  //     this.previousCount = 'RTT';
  //   }
  //   this.previousDate = absence.date;
  // }

  // decreaseCountNew(absence) {
  //   if (absence.typeConge === this.previousCount && this.previousDate === absence.date) {
  //     this.previousDate = absence.date;
  //     this.previousCount = absence.typeConge;
  //     return;
  //   }
  //   if (absence.typeConge === 'Congés payés'){
  //     if (this.previousCount === 'RTT' && this.previousDate === absence.date && this.countRTTN != 0) {
  //         this.countRTTN = this.previousCountRTTN;
  //     }
  //     if (this.currentUser.cpNMoins1 > 0) {
  //       if(absence.demiJournee){
  //         this.previousCountCPNmoins1 = this.countCPNmoins1;
  //         this.countCPNmoins1 -= 0.5;
  //       } else {
  //         this.previousCountCPNmoins1 = this.countCPNmoins1;
  //         this.countCPNmoins1 -= 1;
  //       }
  //     } else {
  //       this.toastr.error('Votre solde est insuffisant', 'Avertissement');
  //     }
  //     this.previousCount = 'Congés payés';
  //   }
  //   if (absence.typeConge === 'RTT') {
  //     if (this.previousCount === 'Congés payés' && this.previousDate === absence.date && this.countCPNmoins1 != 0) {
  //       this.countCPNmoins1 = this.previousCountCPNmoins1;
  //     }
  //     if(absence.demiJournee){
  //       if (this.countRTTN >=3.5) {
  //         this.previousCountRTTN = this.countRTTN;
  //         this.countRTTN -= 3.5;
  //       } else {
  //         this.toastr.error('Votre solde est insuffisant', 'Avertissement');
  //       }
  //     } else {
  //         if (this.countRTTN >=7){
  //           this.previousCountRTTN = this.countRTTN;
  //           this.countRTTN -= 7;
  //         } else {
  //           this.toastr.error('Votre solde est insuffisant', 'Avertissement');
  //         }
  //     }
  //     this.previousCount = 'RTT';
  //   }
  //   this.previousDate = absence.date;
  // }

  autoFillType(absence) {
    let ifrom = 0;
    let countConges = this.countConges();
    // for (let i = 0; i < this.daysOffSelectedObjArr.length; i++) {
    //   if (this.daysOffSelectedObjArr[i].date == absence.date) {
    //     //console.log("found "+date+ " at position "+ i)
    //     ifrom = i;
    //     //break
    //   }
    // }
    // for (; ifrom < this.daysOffSelectedObjArr.length; ifrom++) {
    let half = absence.demiJournee ? 0.5 : 1;
    if (absence.typeConge == 'Congés payés' && countConges - half < 0 && !this.allowAnticipation) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      const dialogRef = this.dialog.open(AllowAnticipationDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        (data) => {
          this.allowAnticipation = data;
        });
      // break;
    }
    // this.daysOffSelectedObjArr[ifrom].typeConge = absence.typeConge;
    // // this.decreaseCountNew(this.daysOffSelectedObjArr[ifrom]);
    // if(this.daysOffSelectedObjArr[ifrom+1].typeConge == absence.typeConge){
    //   break;
    // }
    // }
    // if (this.daysOffSelectedObjArr.length > 1) {
    //   this.toastr.warning('Le motif d\'absence "' + absence.typeConge + '" a été appliqué à toutes les dates sélectionnées à partir du ' + absence.date + '. Veuillez le préciser si nécessaire.', 'Attention');
    // }
  }

  autoFillTypeInPlage(absence, plageArr) {
    let ifrom = 0;
    let countConges = this.countConges();
    for (let i = 0; i < plageArr.length; i++) {
      if (plageArr[i].date == absence.date) {
        //console.log("found "+date+ " at position "+ i)
        ifrom = i;
        //break
      }
    }
    for (; ifrom < plageArr.length; ifrom++) {
      let half = absence.demiJournee ? 0.5 : 1;
      if (absence.typeConge == 'Congés payés' && countConges - half < 0 && !this.allowAnticipation) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(AllowAnticipationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          (data) => {
            this.allowAnticipation = data;
          });
        break;
      }
      plageArr[ifrom].typeConge = absence.typeConge;
      // this.decreaseCountNew(this.daysOffSelectedObjArr[ifrom]);
    }
    if (plageArr.length > 1) {
      this.toastr.warning('Le motif d\'absence "' + absence.typeConge + '" a été appliqué à toutes les dates sélectionnées à partir du ' + absence.date + '. Veuillez le préciser si nécessaire.', 'Attention');
    }
  }

  checkDay(day) {
    let d = moment(day).format('DD/MM/YYYY');
    for (let x of this.daysOffSelectedObjArr) {
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

  checkWeekends(day: Date, iteration) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || DemandeCongeComponent.joursFeries(this.dateNow.getFullYear()+iteration).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || DemandeCongeComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  getHolidays() {
    this.userService.getCongeForUser(this.currentUser).subscribe(
      (data) => {
        for (let d of data) {
          //this.mesConges.push(moment(d.date).format('DD/MM/YYYY').toString());
          this.daysOffSavedObjArr.push(({
            date: moment(d.date).format('DD/MM/YYYY').toString(),
            typeConge: d.typeConge,
            demiJournee: d.demiJournee,
            typeDemiJournee: d.typeDemiJournee,
            valideRH: d.valideRH,
            documentJointUri: d.documentJointUri
          }));
        }
        console.log(this.splitArrayInRanges(this.daysOffSavedObjArr));
      }
    );
  }

  splitArrayInRanges(arr) {
    // return arr.reduce(function (obj, item) {
    //   obj[item.typeConge] = obj[item.typeConge] || [];
    //   obj[item.typeConge].push(item.date);
    //   return obj;
    // }, {});
    let newArr = [];
    let plage = [];
    arr.sort((a, b) => this.toDate(a.date).valueOf() - this.toDate(b.date).valueOf());
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) {
        if (this.isFollowingDay(arr[i - 1].date, arr[i].date) && arr[i - 1].typeConge == arr[i].typeConge) {
          if (i - 1 == 0) {
            plage.push(arr[i - 1]);
          }
          plage.push(arr[i]);
          if (i == arr.length-1 || !(this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge)) {
            newArr.push(plage);
            plage = [];
          }
        } else {
          if (this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge) {
            plage.push(arr[i]);
          } else {
            newArr.push(arr[i]);
          }
        }
      }
    }
    return newArr;
  }

  isFollowingDay(date1:Date,date2:Date){
    let d1 = this.toDate(date1);
    let d2 = this.toDate(date2);
    let d3 = new Date(d2);
    d3.setDate(d2.getDate() - 1);
    let year = d3.getFullYear();
    let i = 1;
    while(this.checkWeekendsWithYear(d3,year)){
      d3.setDate(d3.getDate() - 1);
      year = d3.getFullYear();
      i++;
    }
    return d2.getDate() == d1.getDate() + i;
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

  toDate(s) {
    return new Date(s.substr(6, 4), s.substr(3, 2) - 1, s.substr(0, 2));
  }

  isArray(a) {
    return Array.isArray(a);
  }

  addRemoveDay(event,x) {
    if (this.checkAskedHolidays(event) || this.checkWeekends(event,x)) {
      return;
    }
    let day = moment(event).format('DD/MM/YYYY');
    if (this.plage && this.firstClick) {
      let stopDate = moment(event);
      let f = moment(this.firstDay);
      while (f.toDate() < stopDate.toDate()) {
        f.add(1, 'd');
        if (this.checkAskedHolidays(f.toDate()) || this.checkWeekends(f.toDate(),x)) {
          continue;
        } else {
          this.dayoffPlage.push({
            date: f.format('DD/MM/YYYY'),
            typeConge: '',
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
          this.dayoffPlage.sort((a, b) => a.date.localeCompare(b.date));
        }
      }
      for (let dp of this.dayoffPlage) {
        if (this.includesDay(this.daysOffSelectedObjArr, moment(dp).format('DD/MM/YYYY'))) {
          this.toastr.error('Cette plage contient un jour déjà selectionné. Veuillez faire une nouvelle sélection', 'Erreur de sélection');
          this.firstDay = null;
          this.firstClick = false;
          this.plage = false;
          this.dayoffPlage = [];
          return;
        }
      }
      if (this.includesArray(this.daysOffSelectedObjArr, this.dayoffPlage)) {
        this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(this.plage), 1);
        this.firstDay = null;
        this.firstClick = false;
        this.plage = false;
        this.dayoffPlage = [];
        return;
      }
      if (this.firstDay.format('DD/MM/YYYY') == stopDate.format('DD/MM/YYYY')) {
        for (let arr of this.daysOffSelectedObjArr) {
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
        this.daysOffSelectedObjArr.push({
          date: day,
          typeConge: '',
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
        this.daysOffSelectedObjArr.sort((a, b) => a.date.localeCompare(b.date));
        this.firstDay = null;
        this.firstClick = false;
        this.plage = false;
        this.dayoffPlage = [];
        return;
      }
      for (let dayArr of this.daysOffSelectedObjArr) {
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
              if (this.checkAskedHolidays(lastday.toDate()) || this.checkWeekends(lastday.toDate(),x)) {
                continue;
              } else {
                dayArr.push({
                  date: lastday.format('DD/MM/YYYY'),
                  typeConge: '',
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
                this.autoFillTypeInPlage(dayArr[0],dayArr);
                dayArr.sort((a, b) => a.date.localeCompare(b.date));
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
              if (this.checkAskedHolidays(firstArrDay.toDate()) || this.checkWeekends(firstArrDay.toDate(),x)) {
                continue;
              } else {
                dayArr.push({
                  date: firstArrDay.format('DD/MM/YYYY'),
                  typeConge: '',
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
                this.autoFillTypeInPlage(dayArr[0],dayArr);
                dayArr.sort((a, b) => a.date.localeCompare(b.date));
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
      this.daysOffSelectedObjArr.push(this.dayoffPlage);
      this.firstDay = null;
      this.firstClick = false;
      this.plage = false;
      this.dayoffPlage = [];
      return;
    }
    if (this.plage && !this.firstClick) {
      this.firstClick = true;
      this.firstDay = moment(event);
      this.dayoffPlage.push({
        date: day,
        typeConge: '',
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
      this.dayoffPlage.sort((a, b) => a.date.localeCompare(b.date));
      return;
    }
    for (let plageArr of this.daysOffSelectedObjArr) {
      if (this.isArray(plageArr)) {
        if (this.includesDay(plageArr, day)) {
          this.toastr.error('Cette date est déjà contenue dans une plage', 'Erreur de sélection');
          return;
        }
      }
    }
    if (this.includesDay(this.daysOffSelectedObjArr, day) && !this.mouseDown) {
      this.spliceDay(this.daysOffSelectedObjArr, day);
    } else if (this.includesDay(this.daysOffSelectedObjArr, day) && this.mouseDown) {
      return;
    } else {
      //this.daysOff.push(day);
      this.daysOffSelectedObjArr.push({
        date: day,
        typeConge: '',
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
      this.daysOffSelectedObjArr.sort((a, b) => a.date.localeCompare(b.date));
      //this.daysOff.sort();
    }
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

  includesArray(arr, arr2) {
    for (let x of arr) {
      if(this.isArray(x))
        if (x[0].date == arr2[0].date && x[x.length-1].date == arr2[arr2.length-1].date) {
        return true;
      }
    }
    return false;
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

  // joursOuvres() {
  //   let jo = [];
  //   for (let d of this.getDaysInMonth(this.dateNow.getMonth(), this.dateNow.getFullYear())) {
  //     if (!this.checkWeekends(d)) {
  //       jo.push(d);
  //     }
  //   }
  //   return jo;
  // }

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

  toMomentFormat(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  disableTabs(number, year) {
    if(year === this.dateNow.getFullYear()){
      return this.dateNow.getMonth() > number
    }
    return false;

  }

  sendRequest(form: NgForm, d) {
    this.FicheEnvoyee = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          let cArray = [];
          let congeSansJustif = [];
          for (let conge of this.daysOffSelectedObjArr) {
            if (this.isArray(conge)) {
              for (let subConge of conge) {
                let c = new CongeModel();
                c.documentJointType = subConge.documentJointType;
                c.user = this.currentUser;
                c.documentJointUri = subConge.documentJointUri;
                c.justificatifRecu = conge[0].documentJointUri != '';
                c.demiJournee = subConge.demiJournee;
                c.typeDemiJournee = subConge.typeDemiJournee;
                c.date = this.toDate(subConge.date);
                c.valideRH = false;
                c.typeConge = subConge.typeConge;
                c.commentaires = subConge.commentaires;
                c.typeCe = subConge.typeCe;
                cArray.push(c);
                if (c.typeConge == 'Absence Exceptionnelle' && !c.justificatifRecu) {
                  congeSansJustif.push(c);
                }
              }
              continue;
            } else {
              let co = new CongeModel();
              co.documentJointType = conge.documentJointType;
              co.user = this.currentUser;
              co.documentJointUri = conge.documentJointUri;
              co.justificatifRecu = conge.documentJointUri != '';
              co.demiJournee = conge.demiJournee;
              co.typeDemiJournee = conge.typeDemiJournee;
              co.date = this.toDate(conge.date);
              co.valideRH = false;
              co.typeConge = conge.typeConge;
              co.commentaires = conge.commentaires;
              co.typeCe = conge.typeCe;
              cArray.push(co);
              if (co.typeConge == 'Absence Exceptionnelle' && !co.justificatifRecu) {
                congeSansJustif.push(co);
              }
            }
          }
          for (let c of cArray) {
            this.congeService.addConge(c).subscribe(
              () => {
              },
              (error) => {
                this.toastr.error('Erreur d\'ajout');
              }
            );
          }
          this.currentUser.cpNMoins1 = this.countConges();
          this.currentUser.cpN = this.countCongesAnticipes();
          this.currentUser.rttn = this.countRTT();
          this.userService.editUser(this.currentUser).subscribe(
            () => {
              this.toastr.success('Demande envoyée', 'Confirmation d\'envoi');
              this.userService.getUser(this.currentUser.id).subscribe(
                (user) => {
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  this.daysOffSelectedObjArr = [];
                  if (congeSansJustif.length > 0) {
                    let i = 0;
                    let identicalCe = [];
                    let sCongeSansJustif = '';
                    for (let ob of congeSansJustif) {
                      if(ob == congeSansJustif[congeSansJustif.length-1] && (new Date(ob.date).getDate() === new Date(congeSansJustif[i-1].date).getDate()+1)){
                        identicalCe.push(ob);
                        break;
                      }
                      if((new Date(ob.date).getDate() === new Date(congeSansJustif[i+1].date).getDate()-1) && identicalCe.indexOf(ob)==-1){
                        identicalCe.push(ob);
                      } else {
                        let sLine = new Date(ob.date).toLocaleDateString() + ' : ' + ob.typeCe + '\n';
                        sCongeSansJustif += sLine;
                      }
                      i++;
                    }
                    sCongeSansJustif += 'Du ' + new Date(identicalCe[0].date).toLocaleDateString() +' au '+new Date(identicalCe[identicalCe.length-1].date).toLocaleDateString() +' : ' + identicalCe[0].typeCe + '\n';
                    this.emailService.sendMail('Bonjour,\n Vous avez envoyé une demande d\'absence exceptionnelle sans justificatif pour les jours suivants :\n' + sCongeSansJustif + '\n Veuillez prendre note de fournir les pièces justificatives correspondantes avant la fin du mois.\n Merci', 'Notification de pièce justificative manquante', this.currentUser.email).subscribe(
                      () => {
                        this.FicheEnvoyee = false;
                        this.ngOnInit();
                      }
                    );
                  } else {
                    this.FicheEnvoyee = false;
                    this.ngOnInit();
                  }
                }
              );
            }
          );
        }
        this.FicheEnvoyee = false;
      });
    // for (let key in form.value) {
    //   //console.log(key + "boucle "+ i);
    //   if (i % 3 == 0) {
    //     //console.log("creation "+i);
    //     conge = new CongeModel();
    //     conge.user = this.currentUser;
    //   }
    //   if (form.value.hasOwnProperty(key)) {
    //     if (key.endsWith(' comm')) {
    //       //console.log("comm "+i);
    //       conge.commentaires = form.value[key];
    //       this.congeService.addConge(conge).subscribe(
    //         () => {
    //           this.currentUser.cpNMoins1 = this.countConges();
    //           this.currentUser.cpN = this.countCongesAnticipes();
    //           this.currentUser.rttn = this.countRTT();
    //           this.userService.editUser(this.currentUser).subscribe(
    //             ()=> {
    //               this.toastr.success('Ajouté');
    //               this.userService.getUser(this.currentUser.id).subscribe(
    //                 (user)=>localStorage.setItem('currentUser', JSON.stringify(user))
    //               )
    //             }
    //           )
    //         },
    //         (error) => {
    //           this.toastr.error('Erreur d\'ajout');
    //         }
    //       );
    //     } else {
    //       if (key.endsWith(' boolean')) {
    //         //console.log("bool "+i);
    //         conge.demiJournee = form.value[key];
    //       } else {
    //         //console.log("date et type "+i);
    //         conge.date = new Date(Number(key.split('/')[2]), Number(key.split('/')[1]) - 1, Number(key.split('/')[0]));
    //         conge.typeConge = form.value[key];
    //       }
    //     }
    //   }
    //   i++;
    // }
  }

  countRTT() {
    let count = this.currentUser.rttn;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 3.5 : 7;
          if (det.typeConge == 'RTT') {
            count -= half;
          }
        }
      } else {
        let half = d.demiJournee ? 3.5 : 7;
        if (d.typeConge == 'RTT') {
          count -= half;
        }
      }
    }
    this.rttValid = count >= 0;
    return count;
  }

  countConges() {
    let count = this.currentUser.cpNMoins1;
    let countAnciente = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 0.5 : 1;
          if (det.typeConge == 'Congés payés') {
            if (countAnciente - half < 0) {
              if (count - half < 0) {
                break;
              }
              count -= half;
            } else {
              countAnciente -= half;
            }
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés payés') {
          if (countAnciente - half < 0) {
            if (count - half < 0) {
              break;
            }
            count -= half;
          } else {
            countAnciente -= half;
          }
        }
      }
    }
    if (count == 0 && this.countCongesAnticipes() == this.currentUser.cpN) {
      this.allowAnticipation = false;
    }
    return count;
  }

  countAnciennete() {
    let count = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = d.demiJournee ? 0.5 : 1;
          if (d.typeConge == 'Congés payés') {
            if (count - half < 0) {
              break;
            }
            count -= half;
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés payés') {
          if (count - half < 0) {
            break;
          }
          count -= half;
        }
      }
    }
    return count;
  }

  countCongesAnticipes() {
    let count = this.currentUser.cpN;
    let countCPNmoins1 = this.currentUser.cpNMoins1;
    let countAnciente = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 0.5 : 1;
          if (det.typeConge == 'Congés payés') {
            if (countAnciente - half < 0) {
              if (countCPNmoins1 - half < 0) {
                if (this.allowAnticipation) {
                  if (count - half < 0) {
                    break;
                  }
                  count -= half;
                } else {
                  break;
                }
              } else {
                countCPNmoins1 -= half;
              }
            } else {
              countAnciente -= half;
            }
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés payés') {
          if (countAnciente - half < 0) {
            if (countCPNmoins1 - half < 0) {
              if (this.allowAnticipation) {
                if (count - half < 0) {
                  break;
                }
                count -= half;
              } else {
                break;
              }
            } else {
              countCPNmoins1 -= half;
            }
          } else {
            countAnciente -= half;
          }
        }
      }
    }
    return count;
  }

  countAbsences(form: NgForm) {
    let count = 0;
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Absences exceptionnelle') {
          if (nextValue) {
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
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Congé sans solde') {
          if (nextValue) {
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
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Arrêt maladie') {
          if (nextValue) {
            count = count + 0.5;
          } else {
            count++;
          }
        }
      }
    }
    return count;
  }

  handleFile(dayoff) {
    let file = dayoff.rawFile[0];
    if (file) {
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          dayoff.documentJointUri = this.fileEncoded;
          this.fileEncoded = null;
          dayoff.documentJointType = this.filename.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          dayoff.documentJointUri = this.fileEncoded;
          this.fileEncoded = null;
          dayoff.documentJointType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      }

      // this.selectedFiles.splice(i,1);
      // i--
    }
  }

  _handleReaderLoadedIE(readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileEncoded = btoa(binary);
  }

  _handleReaderLoaded(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileEncoded = btoa(readerEvt.target.result);
  }

  public base64ToBlob(b64Data, contentType = '', sliceSize = 512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
  }

}
