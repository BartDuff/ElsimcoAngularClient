import { Component, OnInit } from '@angular/core';
import {CongeModel} from '../models/conge.model';
import {UserService} from '../services/user.service';
import {FicheService} from '../services/fiche.service';
import {PdfService} from '../services/pdf.service';
import {ToastrService} from 'ngx-toastr';
import {CongeService} from '../services/conge.service';
import {UserModel} from '../models/user.model';
import * as moment from 'moment';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {EmailService} from '../services/email.service';
import {toNumber} from 'ngx-bootstrap/timepicker/timepicker.utils';
import {ImageService} from '../services/image.service';

@Component({
  selector: 'app-conge-list',
  templateUrl: './conge-list.component.html',
  styleUrls: ['./conge-list.component.css']
})
export class CongeListComponent implements OnInit {
  currentUser:UserModel;
  conges : CongeModel[] = [];
  loading = true;
  joursDeLaSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  daysOffSavedObjArr = [];
  congeSansJustif = [];
  sortedCSJ;
  fileEncoded;
  filename;
  fileValid = false;
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  absTypes = ['RTT', 'Congés Payés', 'Absence Exceptionnelle', 'Congés Sans Solde'];
  absShortTypes = ['RTT', 'CP', 'A.E.', 'C.S.S.'];
  dateNow: Date;

  constructor(private userService: UserService,
              private congeService: CongeService,
              private toastr:ToastrService,
              private dialog: MatDialog,
              private emailService: EmailService,
              private imageService: ImageService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getCongesForUser();
    this.getHolidays();
    this.dateNow = new Date();
  }

  getHello(){
    let date = new Date();
    let hour = date.getHours();
    if (hour >= 5 && hour <= 17) {
      return "Bonjour";
    } else {
      return "Bonsoir";
    }
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  sendJustif() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d) => {
        if (d) {
          let dates = [];
          for (let ok of Object.keys(this.sortedCSJ)) {
            if(isNaN(new Date(parseInt(ok.split('/')[2]), parseInt(ok.split('/')[1]) - 1, parseInt(ok.split('/')[0])).getTime())){
              let deb = ok.substr(3,10);
              let dateDeb = new Date(parseInt(ok.substr(3,10).split('/')[2]), parseInt(ok.substr(3,10).split('/')[1]) - 1, parseInt(ok.substr(3,10).split('/')[0]));
              let fin = ok.substr(17,10);
              let dateFin = new Date(parseInt(ok.substr(17,10).split('/')[2]), parseInt(ok.substr(17,10).split('/')[1]) - 1, parseInt(ok.substr(17,10).split('/')[0]));
              while (dateDeb <= dateFin) {
                dates.push(new Date (dateDeb));
                dateDeb.setDate(dateDeb.getDate() +1);
              }
            }
          }
          for (let c of this.congeSansJustif) {
            c.justificatifRecu = !!c.fileId;
          }
          for(let d of dates){
            if(this.congeSansJustif.find((x => new Date(x.date).toLocaleDateString() === new Date(d).toLocaleDateString()))){
              let c = this.congeSansJustif.find((x => new Date(x.date).toLocaleDateString() === new Date(d).toLocaleDateString()));
              let nDate = new Date(c.date);
              nDate.setDate(nDate.getDate()-1);
              // for(let csj of this.congeSansJustif){
              //   console.log((new Date(csj.date).toLocaleDateString()));
              //   console.log(new Date(nDate).toLocaleDateString());
              // }
              let bc = this.congeSansJustif.find((x => new Date(x.date).toLocaleDateString() === new Date(nDate).toLocaleDateString()));
              if(bc != undefined && bc.justificatifRecu){
                c.justificatifRecu = true;
              }
            }
          }
          this.congeService.editMultipleConge(this.congeSansJustif).subscribe(
            () => {
              this.emailService.sendMail(this.getHello()+',\nUne nouvelle pièce justificative a été envoyée par ' + this.currentUser.prenom + ' ' + this.currentUser.nom, 'Notification d\'envoi de pièce justificative', 'majoline.domingos@elsimco.com').subscribe(
                () => {
                  for (let c of this.congeSansJustif) {
                    if (c.justificatifRecu) {
                      this.congeSansJustif.splice(this.congeSansJustif.indexOf(c), 1);
                      this.congeService.sortConges(this.congeSansJustif).subscribe(
                        (data)=>{
                          this.sortedCSJ = data;
                          this.ngOnInit();
                        }
                      );
                    }
                  }
                  this.toastr.success('Fichier envoyé');
                }
              );
            },
            (error) => {
              this.toastr.error('Erreur d\'envoi');
            }
          );
        }
      });
  }

  objectKeys(o){
    return o? Object.keys(o):'';
  }

  s(o){
    return JSON.stringify(o);
  }

  findWithDate(date){
    if(!isNaN(new Date(date.split('/')[2], date.split('/')[1] - 1, date.split('/')[0]).getTime())){
      return this.congeSansJustif.find((x => new Date(x.date).toLocaleDateString() === new Date(date.split('/')[2], date.split('/')[1] - 1, date.split('/')[0]).toLocaleDateString()));
    } else {
      return this.congeSansJustif.find((x => new Date(x.date).toLocaleDateString() === new Date(date.substr(3,10).split('/')[2], date.substr(3,10).split('/')[1] - 1, date.substr(3,10).split('/')[0]).toLocaleDateString()));
    }
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
            valideRH: d.valideRH
          }));
          if (d.typeConge == 'Absence Exceptionnelle' && !d.justificatifRecu) {
            this.congeSansJustif.push(d);
          }
        }
        this.congeService.sortConges(this.congeSansJustif).subscribe(
          (data)=>{
            this.sortedCSJ = data;
          }
        );
        this.loading = false;
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

  includesDay(arr, date) {
    for (let x of arr) {
      if (x.date == date) {
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
    for (let i = 0; i < t.length; i++) {
      sDates.push(moment(t[i]).format('DD/MM/YYYY'));
    }
    return sDates;
  }

  toMomentFormat(date: Date) {
    return moment(date).format('DD/MM/YYYY');
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

  addCells(number) {
    let d = this.getWeekday(new Date(this.dateNow.getFullYear(), number, 1));
    return d;
  }

  getDayColor(day) {
    if (this.checkWeekends(day)) {
      return 'grey';
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

  getAbsTypeShort(date) {
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

  checkWeekends(day: Date) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || CongeListComponent.joursFeries(this.dateNow.getFullYear()).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  // checkDay(day) {
  //   let d = moment(day).format('DD/MM/YYYY');
  //   for (let x of this.daysOffSelectedObjArr) {
  //     if (x.date == d) {
  //       return true;
  //     }
  //   }
  //   return false;
  //   //return this.daysOff.includes(d)
  // }

  getCongesForUser() {
    this.userService.getCongeForUser(this.currentUser).subscribe(
      (data) => {this.conges = data;}
    );
  }

  getNonValidatedConges(){
    let congesAttente = [];
    for(let c of this.conges) {
      if (!c.valideRH)
        congesAttente.push(c);
    }
    congesAttente = congesAttente.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
    return congesAttente;
  }

  getValidatedConges(){
    let congesValide = [];
    for(let c of this.conges) {
      if (c.valideRH)
        congesValide.push(c);
    }
    congesValide = congesValide.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());
    return congesValide;
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
        if(arr.length>1){
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

  toDate(s) {
    return new Date(s.substr(6, 4), s.substr(3, 2) - 1, s.substr(0, 2));
  }

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || CongeListComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
  }

  isArray(a) {
    return Array.isArray(a);
  }

  handleFile(dayoff) {
    let file = dayoff.rawFile[0];
    if (file) {
      this.filename = file.file.name;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          this.postImage(dayoff);
          this.fileEncoded = null;
          // dayoff.documentJointType = file.file.name.split('.')[file.file.name.split('.').length - 1];
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          this.postImage(dayoff);
          this.fileEncoded = null;
          // dayoff.documentJointType = file.file.name.split('.')[file.file.name.split('.').length - 1];
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
    this.fileValid = false;
    this.imageService.uploadJustif({imageJointe: this.fileEncoded, imageJointeType: this.filename.split('.')[this.filename.split('.').length - 1].toLowerCase(), id: null, originalFilename: this.filename }).subscribe(
      (data)=>{
        dayoff.fileId = data.id;
        this.fileValid = true;
      }
    )
  }

}
