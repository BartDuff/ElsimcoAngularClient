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
import {ImageService} from '../services/image.service';

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
  firstDateToastr;
  secondDateToastr;
  counter;
  cachedUser;
  mouseDown: boolean = false;
  rttValid = true;
  previousAnciennete;
  previousCpnMoins1;
  previousCpn;
  fileValid = true;
  loading = false;
  joursDeLaSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  //daysOff = [];
  daysOffSelectedObjArr = [];
  daysOffSavedObjArr = [];
  dayoffPlage = [];
  zeroIndicator:number;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  absTypes = ['Congés Payés', 'RTT', 'Absence Exceptionnelle', 'Congés Sans Solde'];
  absShortTypes = ['CP', 'RTT', 'A.E.', 'C.S.S.'];
  fixedDateNow: Date;
  dateNow: Date;
  FicheEnvoyee: boolean = false;
  currentUser: UserModel;
  congesCount;
  anticipeCount;
  ancienneteCount;
  rttCount;
  selectedFiles;
  filename;
  fileEncoded;
  plage: boolean = false;
  firstClick: boolean = false;
  firstDay;

  getHello(){
    let date = new Date();
    let hour = date.getHours();
    if (hour >= 5 && hour <= 17) {
      return "Bonjour";
    } else {
      return "Bonsoir";
    }
  }

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

  ScrollDown(){
    let el = document.getElementById("formulaire");
    el.scrollIntoView();
  }

  countSelectedDays(){
    let count = 0;
    for(let el of this.daysOffSelectedObjArr) {
      if(this.isArray(el)){
        count += el.length;
      } else {
        count += 1;
      }
    }
    if(count<=1){
      return count + " jour sélectionné";
    } else {
      return count + " jours sélectionnés";
    }
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

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  constructor(private toastr: ToastrService, private cdRef: ChangeDetectorRef, private pdfService: PdfService, private userService: UserService, private congeService: CongeService, private emailService: EmailService, private dialog: MatDialog, private imageService: ImageService) {
  }

  showToastr(){
    this.toastr.toastrConfig.closeButton= true;
    this.toastr.toastrConfig.disableTimeOut = true;
    let firstToastr = this.toastr.info("Sélectionner la première date de la plage","Sélection de plage de date");
    this.firstDateToastr = firstToastr.toastRef.componentInstance;
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
    if(this.plage && this.firstClick && moment(day).format('DD/MM/YYYY') == this.dayoffPlage[0].date){
      return 'orange';
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
    return this.splitArrayInRanges(holidayMonthArr);
  }

  addCells(number, iteration) {
    let d = this.getWeekday(new Date(this.dateNow.getFullYear() + iteration, number, 1));
    return d;
  }

  s(ss) {
    return JSON.stringify(ss, null, 4);
  }

  c(cc) {
    console.log(cc);
  }

  ngOnInit() {
    // this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.cachedUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getUser(this.cachedUser.id);
    // this.getUser(8942);
    //this.selectedDate = moment(new Date());

    // this.zeroIndicator = this.countConges();
    this.dateNow = new Date();
    this.fixedDateNow = new Date();
    this.FicheEnvoyee = null;
    // this.dateFilter(this.dateNow);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  getUser(id){
    this.userService.getUser(id).subscribe(
      (data) => {
        this.currentUser = data;
        this.counter = this.currentUser.cpNMoins1 > 0 ? this.currentUser.cpNMoins1 + this.currentUser.congeAnciennete : this.currentUser.cpN;
        this.congesCount = this.currentUser.cpNMoins1;
        this.anticipeCount = this.currentUser.cpN;
        this.ancienneteCount = this.currentUser.congeAnciennete;
        this.rttCount = this.currentUser.rttn;
        this.zeroIndicator = this.currentUser.cpNMoins1;
        this.getHolidays();
      }
    )
  }

  compare(a,b){
    if(this.isArray(a) && this.isArray(b)){
      let dateA = this.toDate(a[0].date);
      let dateB = this.toDate(b[0].date);
      return dateA.getTime() - dateB.getTime();
    }
    if(this.isArray(a)&& !this.isArray(b)){
      let dateA = this.toDate(a[0].date);
      let dateB = this.toDate(b.date);
      return dateA.getTime() - dateB.getTime();
    }
    if(!this.isArray(a)&& this.isArray(b)){
      let dateA = this.toDate(a.date);
      let dateB = this.toDate(b[0].date);
      return dateA.getTime() - dateB.getTime();
    }
    if(!this.isArray(a)&& !this.isArray(b)){
      let dateA = this.toDate(a.date);
      let dateB = this.toDate(b.date);
      return dateA.getTime() - dateB.getTime();
    }
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

    // for (let i = 0; i < this.daysOffSelectedObjArr.length; i++) {
    //   if (this.daysOffSelectedObjArr[i].date == absence.date) {
    //     //console.log("found "+date+ " at position "+ i)
    //     ifrom = i;
    //     //break
    //   }
    // }
    // for (; ifrom < this.daysOffSelectedObjArr.length; ifrom++) {
    let half = absence.demiJournee ? 0.5 : 1;
    if (absence.typeConge == 'Congés Payés' && this.zeroIndicator -half < 0 && !this.allowAnticipation) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      const dialogRef = this.dialog.open(AllowAnticipationDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(
        (data) => {
          if (data) {
            this.allowAnticipation = data;
          } else {
            this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(absence), 1);
            this.zeroIndicator += half;
          }
        });
      // break;
    }
    if(absence.typeConge == 'Congés Payés') {
      this.zeroIndicator -= half;
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

  // autoFillType(absence) {
  //   let half = absence.demiJournee ? 0.5 : 1;
  //   if (absence.typeConge == 'Congés Payés') {
  //     if (this.currentUser.cpNMoins1 - half >= 0) {
  //       this.currentUser.cpNMoins1 -= half;
  //     }
  //     if (this.currentUser.cpNMoins1 - half < 0) {
  //       if (half == 1 && this.currentUser.cpNMoins1 != 0) {
  //         this.currentUser.cpNMoins1 = 0;
  //         this.currentUser.cpN -= 0.5;
  //       } else {
  //         this.currentUser.cpN -= half;
  //       }
  //     }
  //   }
  //   if (absence.typeConge == 'RTT') {
  //     if (this.currentUser.rttn - half >= 0) {
  //       this.currentUser.rttn -= half;
  //       this.rttValid = true;
  //     }
  //     if (this.currentUser.rttn - half < 0) {
  //       this.toastr.error("Solde épuisé","Votre solde de RTT est insuffisant");
  //       this.rttValid = false;
  //     }
  //   }

    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;
    // const dialogRef = this.dialog.open(AllowAnticipationDialogComponent, dialogConfig);
    // dialogRef.afterClosed().subscribe(
    //   (data) => {
    //     if (data) {
    //       this.allowAnticipation = data;
    //     } else {
    //       this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(absence), 1);
    //       this.zeroIndicator += half;
    //     }
    //   });
  // }

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
      let half = absence.demiJournee ? 0.5 : 1;
      if (absence.typeConge == 'Congés Payés' && this.zeroIndicator < 0 && !this.allowAnticipation) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        const dialogRef = this.dialog.open(AllowAnticipationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
          (data) => {
            if (data) {
              this.allowAnticipation = data;
            } else {
              this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(plageArr), 1);
              this.zeroIndicator += plageArr.length;
              return;
            }
          });
      }
      plageArr[ifrom].typeConge = absence.typeConge;
      this.zeroIndicator -= half;
      // this.decreaseCountNew(this.daysOffSelectedObjArr[ifrom]);
    }
    if (plageArr.length > 1) {
      this.toastr.warning('Le type d\'absence a été appliqué à toutes les dates de la plage sélectionnée du ' + plageArr[0].date + ' au '+plageArr[plageArr.length-1].date , 'Attention',{extendedTimeOut: 2000});
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
    return d === 'dim.' || d === 'sam.' || DemandeCongeComponent.joursFeries(this.dateNow.getFullYear() + iteration).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || DemandeCongeComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  getHolidays() {
    this.loading = true;
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
        this.loading = false;
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
          plage.push(arr[i]);
          if (i == arr.length - 1 || !(this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge)) {
            newArr.push(plage);
            plage = [];
          }
        } else {
          if (i != arr.length - 1) {
            if (this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge) {
              plage.push(arr[i]);
            } else {
              newArr.push(arr[i]);
            }
          } else {
            newArr.push(arr[i]);
          }
        }
      } else {
        if (arr.length > 1) {
          if (this.isFollowingDay(arr[i].date, arr[i + 1].date) && arr[i].typeConge == arr[i + 1].typeConge) {
            plage.push(arr[i]);
          } else {
            newArr.push(arr[i]);
          }
        } else {
          newArr.push(arr[i]);
        }
      }
    }
    return newArr;
  }

  isFollowingDay(date1: Date, date2: Date) {
    let d1 = this.toDate(date1);
    let d2 = this.toDate(date2);
    let d3 = new Date(d2);
    d3.setDate(d2.getDate() - 1);
    let year = d3.getFullYear();
    let i = 1;
    while (this.checkWeekendsWithYear(d3, year)) {
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

  addRemoveDay(event, x) {
    if (this.checkAskedHolidays(event) || this.checkWeekends(event, x)) {
      return;
    }
    let day = moment(event).format('DD/MM/YYYY');
    if (this.plage && this.firstClick) {
      this.secondDateToastr.remove();
      this.toastr.toastrConfig.closeButton= false;
      this.toastr.toastrConfig.disableTimeOut = false;
      let stopDate = moment(event);
      let f = moment(this.firstDay);
      while (f.toDate() < stopDate.toDate()) {
        f.add(1, 'd');
        if (this.checkAskedHolidays(f.toDate()) || this.checkWeekends(f.toDate(), x)) {
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
          this.dayoffPlage.sort((a, b) => this.compare(a,b));
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
        this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(this.dayoffPlage), 1);
        this.zeroIndicator += this.dayoffPlage.length;
        if (this.countCongesAnticipes() == this.currentUser.cpN) {
          this.allowAnticipation = false;
        }
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
        this.daysOffSelectedObjArr.sort((a, b) => this.compare(a,b));
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
              if (this.checkAskedHolidays(lastday.toDate()) || this.checkWeekends(lastday.toDate(), x)) {
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
                this.autoFillTypeInPlage(dayArr[0], dayArr);
                dayArr.sort((a, b) => this.compare(a,b));
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
              if (this.checkAskedHolidays(firstArrDay.toDate()) || this.checkWeekends(firstArrDay.toDate(), x)) {
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
                this.autoFillTypeInPlage(dayArr[0], dayArr);
                dayArr.sort((a, b) => this.compare(a,b));
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
      this.daysOffSelectedObjArr.sort((a, b) => this.compare(a,b));
      this.firstDay = null;
      this.firstClick = false;
      this.plage = false;
      this.dayoffPlage = [];
      return;
    }
    if (this.plage && !this.firstClick) {
      this.firstDateToastr.remove();
      let secondToastr = this.toastr.info("Sélectionner la dernière date de la plage","Sélection de plage de date");
      this.secondDateToastr = secondToastr.toastRef.componentInstance;
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
      this.dayoffPlage.sort((a, b) => this.compare(a,b));
      return;
    }
    for (let plageArr of this.daysOffSelectedObjArr) {
      if (this.isArray(plageArr)) {
        if (this.includesDay(plageArr, day)) {
          if(day == plageArr[0].date){
            this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(plageArr),1);
            this.zeroIndicator += plageArr.length;
            if (this.countCongesAnticipes() == this.currentUser.cpN) {
              this.allowAnticipation = false;
            }
          } else {
            let numDeleted = plageArr.splice(plageArr.findIndex(item => item.date === day)+1);
            this.zeroIndicator += numDeleted.length;
            if (this.countCongesAnticipes() == this.currentUser.cpN) {
              this.allowAnticipation = false;
            }
          }
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
      this.daysOffSelectedObjArr.sort((a, b) => this.compare(a,b));
      //this.daysOff.sort();
    }
  }

  spliceDay(arr, date) {
    for (let x of arr) {
      if (x.date == date) {
        let half = x.demiJournee ? 0.5 : 1;
        arr.splice(arr.indexOf(x), 1);
        this.zeroIndicator += half;
      }
    }
    if(this.zeroIndicator>0){
      this.allowAnticipation = false;
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
      if (this.isArray(x)) {
        if (x[0].date == arr2[0].date && x[x.length - 1].date == arr2[arr2.length - 1].date) {
          return true;
        }
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
    if (year === this.dateNow.getFullYear()) {
      return this.dateNow.getMonth() > number;
    }
    return false;

  }

  sendRequest(form: NgForm, d) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          this.FicheEnvoyee = true;
          let cArray = [];
          let periodArray =[];
          let congeSansJustif = [];
          for (let conge of this.daysOffSelectedObjArr) {
            if (this.isArray(conge)) {
              for (let subConge of conge) {
                periodArray.push(this.changeCaseFirstLetter(this.nomsDesMois[this.toDate(subConge.date).getMonth()]) + " "+this.toDate(subConge.date).getFullYear());
                let c = new CongeModel();
                c.documentJointType = subConge.documentJointType;
                c.user = this.currentUser;
                c.documentJointUri = subConge.documentJointUri;
                // c.justificatifRecu = conge[0].documentJointUri != '';
                c.fileId = subConge.fileId;
                if(conge[0].fileId){
                  c.justificatifRecu = true;
                }
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
              periodArray.push(this.changeCaseFirstLetter(this.nomsDesMois[this.toDate(conge.date).getMonth()])+ " "+this.toDate(conge.date).getFullYear());
              let co = new CongeModel();
              co.documentJointType = conge.documentJointType;
              co.user = this.currentUser;
              co.documentJointUri = conge.documentJointUri;
              // co.justificatifRecu = conge.documentJointUri != '';
              co.fileId = conge.fileId;
              if(conge.fileId){
                co.justificatifRecu = true;
              }
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
          let antici = this.countCongesAnticipes();
          this.currentUser.cpNMoins1 = this.countConges();
          this.currentUser.anticipation = this.currentUser.cpN - antici;
          this.currentUser.cpN = this.countCongesAnticipes();
          this.currentUser.rttn = this.countRTT();
          this.currentUser.congeAnciennete = this.countAnciennete();
          this.userService.editUser(this.currentUser).subscribe(
            () => {
              this.toastr.success('Demande envoyée', 'Confirmation d\'envoi');
              const set = new Set(periodArray);
              let uniquePeriod = Array.from(set.values());
              let sPeriod = uniquePeriod.join(", ");
              this.emailService.sendMail(this.getHello()+", \n\n"+this.currentUser.prenom + " "+this.currentUser.nom+" vient d'envoyer une nouvelle demande d'absence pour la période de : "+sPeriod+".","Nouvelle demande d'absence : "+this.currentUser.prenom + " "+this.currentUser.nom,"majoline.domingos@elsimco.com").subscribe(
                ()=>{},
                (error) => {
                  this.toastr.error('Erreur d\'envoi de mail');
                }
              );
              this.userService.getUser(this.currentUser.id).subscribe(
                (user) => {
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  this.daysOffSelectedObjArr = [];
                  if (congeSansJustif.length > 0) {
                    let i = 0;
                    let identicalCe = [];
                    let sCongeSansJustif = '';
                    // for (let ob of congeSansJustif) {
                    //   if (ob == congeSansJustif[congeSansJustif.length - 1] && (new Date(ob.date).getDate() === new Date(congeSansJustif[i - 1].date).getDate() + 1)) {
                    //     identicalCe.push(ob);
                    //     break;
                    //   }
                    //   if ((new Date(ob.date).getDate() === new Date(congeSansJustif[i + 1].date).getDate() - 1) && identicalCe.indexOf(ob) == -1) {
                    //     identicalCe.push(ob);
                    //   } else {
                    //     let sLine = new Date(ob.date).toLocaleDateString() + ' : ' + ob.typeCe + '\n';
                    //     sCongeSansJustif += sLine;
                    //   }
                    //   i++;
                    // }
                    // sCongeSansJustif += 'Du ' + new Date(identicalCe[0].date).toLocaleDateString() + ' au ' + new Date(identicalCe[identicalCe.length - 1].date).toLocaleDateString() + ' : ' + identicalCe[0].typeCe + '\n';
                    this.emailService.sendMailWithRangeForFile(this.getHello()+' '+this.currentUser.prenom+',\n\nVous avez envoyé une demande d\'absence exceptionnelle sans justificatif pour les jours suivants :\n', 'Notification de pièce justificative manquante', this.currentUser.email, congeSansJustif).subscribe(
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

  containsRTT(){
    for(let c of this.daysOffSelectedObjArr){
      if(c.typeConge == "RTT"){
        return true;
        break;
      } else {
        return false;
      }
    }
  }

  countRTT():number {
    let count = this.rttCount;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 3.5 : 7;
          if (det.typeConge == 'RTT') {
            if(count - half <0) {
              this.toastr.error("Cette demande est supérieure à votre solde de RTT", "Solde insuffisant");
              this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(d), 1);
            } else {
              count -= half;
            }
          }
        }
      } else {
        let half = d.demiJournee ? 3.5 : 7;
        if (d.typeConge == 'RTT') {
          if(count - half <0){
            this.toastr.error("Cette demande est supérieure à votre solde de RTT","Solde insuffisant");
            this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(d),1);
          } else {
            count -= half;
          }
        }
      }
    }
    this.rttValid = count >= 0;
    return count;
  }

  countConges():number {
    let count = this.congesCount;
    let countAnciennete = this.ancienneteCount;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 0.5 : 1;
          if (det.typeConge == 'Congés Payés') {
            if (countAnciennete - half < 0) {
              if(countAnciennete-(half/2) == 0){
                countAnciennete -= (half/2);
                count -= (half/2);
              } else {
                if (count - half < 0) {
                  if(count-(half/2) == 0){
                    count -= (half/2);
                    break;
                  } else {
                    break;
                  }
                }
                count -= half;
              }
            } else {
              countAnciennete -= half;
            }
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés Payés') {
          if (countAnciennete - half < 0) {
            if(countAnciennete-(half/2) == 0){
              countAnciennete -= (half/2);
              count -= (half/2);
            } else {
              if (count - half < 0) {
                if(count-(half/2) == 0){
                  count -= (half/2);
                  break;
                } else {
                  break;
                }
              }
              count -= half;
            }
          } else {
            countAnciennete -= half;
          }
        }
      }
    }
    if (count == 0 && this.countCongesAnticipes() == this.currentUser.cpN) {
      this.allowAnticipation = false;
    }
    return count;
  }


  // countConges() {
  //   this.counter = this.currentUser.cpNMoins1 > 0? this.currentUser.cpNMoins1 + this.currentUser.congeAnciennete: this.currentUser.cpN;
  //   for (let d of this.daysOffSelectedObjArr) {
  //     if (this.isArray(d)) {
  //       for (let det of d) {
  //         let half = det.demiJournee ? 0.5 : 1;
  //         if (det.typeConge == 'Congés payés') {
  //             this.counter -= half;
  //
  //         }
  //       }
  //     } else {
  //       let half = d.demiJournee ? 0.5 : 1;
  //       if (d.typeConge == 'Congés payés') {
  //           this.counter -= half;
  //       }
  //     }
  //   }
  //   return this.counter;
  // }

  countAnciennete(): number {
    let count = this.ancienneteCount;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 0.5 : 1;
          if (det.typeConge == 'Congés Payés') {
            if (count - half < 0) {
              if(count-(half/2) == 0){
                count -= (half/2);
                break;
              } else {
                break;
              }
            }
            count -= half;
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés Payés') {
          if (count - half < 0) {
            if(count-(half/2) == 0){
              count -= (half/2);
              break;
            } else {
              break;
            }
          }
          count -= half;
        }
      }
    }
    return count;
  }

  countCongesAnticipes(): number {
    let count = this.anticipeCount;
    let countCPNmoins1 = this.congesCount;
    let countAnciennete = this.ancienneteCount;
    for (let d of this.daysOffSelectedObjArr) {
      if (this.isArray(d)) {
        for (let det of d) {
          let half = det.demiJournee ? 0.5 : 1;
          if (det.typeConge == 'Congés Payés') {
            if (countAnciennete - half < 0) {
              if(countAnciennete-(half/2) == 0){
                countAnciennete -= (half/2);
                countCPNmoins1 -= (half/2);
              } else {
                if (countCPNmoins1 - half < 0) {
                  if(countCPNmoins1-(half/2) == 0) {
                    if(this.allowAnticipation){
                      countCPNmoins1 -= (half / 2);
                      count -= (half / 2);
                    } else {
                      break;
                    }
                  } else {
                    if (this.allowAnticipation) {
                      if(count - half <0){
                        this.toastr.error("Cette demande est supérieure à votre solde de congés","Solde insuffisant");
                        this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(d),1);
                      } else {
                        count -= half;
                      }
                    } else {
                      break;
                    }
                  }
                } else {
                  countCPNmoins1 -= half;
                }
              }
            } else {
              countAnciennete -= half;
            }
          }
        }
      } else {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés Payés') {
          if (countAnciennete - half < 0) {
            if(countAnciennete-(half/2) == 0){
              countAnciennete -= (half/2);
              countCPNmoins1 -= (half/2);
            } else {
              if (countCPNmoins1 - half < 0) {
                if(countCPNmoins1-(half/2) == 0) {
                  if(this.allowAnticipation){
                    countCPNmoins1 -= (half / 2);
                    count -= (half / 2);
                  } else {
                    break;
                  }
                } else {
                  if (this.allowAnticipation) {
                    if(count - half <0){
                      this.toastr.error("Cette demande est supérieure à votre solde de congés","Solde insuffisant");
                      this.daysOffSelectedObjArr.splice(this.daysOffSelectedObjArr.indexOf(d),1);
                    } else {
                      count -= half;
                    }
                  } else {
                    break;
                  }
                }
              } else {
                countCPNmoins1 -= half;
              }
            }
          } else {
            countAnciennete -= half;
          }
        }
      }
    }
    return count;
  }

  countAbsences(form: NgForm):number {
    let count = 0;
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Absences Exceptionnelle') {
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

  countSansSolde(form: NgForm):number {
    let count = 0;
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Congés Sans Solde') {
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


  countMaladie(form: NgForm):number {
    let count = 0;
    for (let key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        let value = form.value[key];
        let nextValue = form.value[key + ' boolean'];
        if (value === 'Arrêt Maladie') {
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
    this.filename = file.file.name;
    if (file) {
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          // dayoff.documentJointUri = this.fileEncoded;
          this.postImage(dayoff);
          this.fileEncoded = null;
          // dayoff.documentJointType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          // dayoff.documentJointUri = this.fileEncoded;
          this.postImage(dayoff);
          this.fileEncoded = null;
          // dayoff.documentJointType = file.file.name.split('.')[file.file.name.split('.').length - 1];
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

  postImage(dayoff){
    this.imageService.uploadJustif({imageJointe: this.fileEncoded, imageJointeType: this.filename.split('.')[this.filename.split('.').length - 1].toLowerCase(), id: null, originalFilename: this.filename }).subscribe(
      (data)=>{
        dayoff.fileId = data.id;
      }
    )
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
