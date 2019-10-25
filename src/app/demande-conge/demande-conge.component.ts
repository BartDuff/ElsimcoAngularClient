import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig, MatMonthView} from '@angular/material';
import {Moment} from 'moment';
import {NgForm} from '@angular/forms';
import {UserModel} from '../models/user.model';
import {ToastrService} from 'ngx-toastr';
import {PdfService} from '../services/pdf.service';
import {UserService} from '../services/user.service';
import { InputFileComponent } from 'ngx-input-file';
import {FicheModel} from '../models/fiche.model';
import htmlToImage from 'html-to-image';
import * as moment from 'moment';
import {CongeModel} from '../models/conge.model';
import {CongeService} from '../services/conge.service';
import {xdescribe} from '@angular/core/testing/src/testing_internal';
import {CommentFicheDialogComponent} from '../dialog/comment-fiche-dialog/comment-fiche-dialog.component';
import {AllowAnticipationDialogComponent} from '../dialog/allow-anticipation-dialog/allow-anticipation-dialog.component';

@Component({
  selector: 'app-demande-conge',
  templateUrl: './demande-conge.component.html',
  styleUrls: ['./demande-conge.component.css']
})
export class DemandeCongeComponent implements OnInit {

  @ViewChild('calendar') calendar: MatMonthView<Moment>;
  @ViewChild('f') f: NgForm;
  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  //selectedDate: Moment;
  allowAnticipation = false;
  mouseDown: boolean = false;
  joursDeLaSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  //daysOff = [];
  daysOffSelectedObjArr = [];
  daysOffSavedObjArr = [];
  nomsDesMois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  absTypes = ['RTT', 'Congés payés', 'Absence Exceptionnelle', 'Congé sans solde'];
  absShortTypes = ['RTT', 'CP', 'C.E.', 'C.S.S.'];
  dateNow: Date;
  FicheEnvoyee: boolean;
  currentUser: UserModel;
  selectedFiles;
  filename;


  getAbsTypeShort(date) {
    for (let x of this.daysOffSavedObjArr) {
      if (x.date == date) {
        return this.absShortTypes[this.absTypes.indexOf(x.typeConge)];
      }
    }
    for (let x of this.daysOffSelectedObjArr) {
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
      if (x.date == date) {
        if (x.demiJournee) {
          return '1/2';
        }
      }
    }
    return '';
  }

  constructor(private toastr: ToastrService, private cdRef: ChangeDetectorRef, private pdfService: PdfService, private userService: UserService, private congeService: CongeService, private dialog:MatDialog) {
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
    for (let i = 0; i < this.daysOffSelectedObjArr.length; i++) {
      if (this.daysOffSelectedObjArr[i].date == absence.date) {
        //console.log("found "+date+ " at position "+ i)
        ifrom = i;
        //break
      }
    }
    for (; ifrom < this.daysOffSelectedObjArr.length; ifrom++) {
      let half = absence.demiJournee ? 0.5 : 1;
      if(absence.typeConge == 'Congés payés' && countConges - half < 0 && !this.allowAnticipation){
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
      this.daysOffSelectedObjArr[ifrom].typeConge = absence.typeConge;
      // this.decreaseCountNew(this.daysOffSelectedObjArr[ifrom]);
      if(this.daysOffSelectedObjArr[ifrom+1].typeConge == absence.typeConge){
        break;
      }
    }
    if (this.daysOffSelectedObjArr.length > 1) {
      this.toastr.warning('Le motif d\'absence "' + absence.typeConge + '" a été appliqué à toutes les dates sélectionnées à partir du ' + absence.date + '. Veuillez le préciser si nécessaire.', 'Attention');
    }
  }

  checkDay(day) {
    let d = moment(day).format('DD/MM/YYYY');
    for (let x of this.daysOffSelectedObjArr) {
      if (x.date == d) {
        return true;
      }
    }
    return false;
    //return this.daysOff.includes(d)
  }

  checkWeekends(day: Date) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || DemandeCongeComponent.joursFeries(this.dateNow.getFullYear()).includes(moment(day).format('DD/MM/YYYY').toString());
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
        }
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

  addRemoveDay(event) {
    if (this.checkAskedHolidays(event) || this.checkWeekends(event)) {
      return;
    }

    let day = moment(event).format('DD/MM/YYYY');
    if (this.includesDay(this.daysOffSelectedObjArr, day) && !this.mouseDown) {
      this.spliceDay(this.daysOffSelectedObjArr, day);
    } else if (this.includesDay(this.daysOffSelectedObjArr, day) && this.mouseDown) {
      return;
    } else {
      //this.daysOff.push(day);
      this.daysOffSelectedObjArr.push({date: day, typeConge: '', demiJournee: false, typeDemiJournee: '', commentaires: '', valideRH: false});
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

  disableTabs(number) {
    return this.dateNow.getMonth() > number;
  }

  sendRequest(form: NgForm) {
    let conge = null;
    let i = 0;
    for (let key in form.value) {
      //console.log(key + "boucle "+ i);
      if (i % 3 == 0) {
        //console.log("creation "+i);
        conge = new CongeModel();
        conge.user = this.currentUser;
      }
      if (form.value.hasOwnProperty(key)) {
        if (key.endsWith(' comm')) {
          //console.log("comm "+i);
          conge.commentaires = form.value[key];
          this.congeService.addConge(conge).subscribe(
            () => {
              this.currentUser.cpNMoins1 = this.countConges();
              this.currentUser.cpN = this.countCongesAnticipes();
              this.currentUser.rttn = this.countRTT();
              this.userService.editUser(this.currentUser).subscribe(
                ()=> {
                  this.toastr.success('Ajouté');
                  this.userService.getUser(this.currentUser.id).subscribe(
                    (user)=>localStorage.setItem('currentUser', JSON.stringify(user))
                  )
                }
              )
            },
            (error) => {
              this.toastr.error('Erreur d\'ajout');
            }
          );
        } else {
          if (key.endsWith(' boolean')) {
            //console.log("bool "+i);
            conge.demiJournee = form.value[key];
          } else {
            //console.log("date et type "+i);
            conge.date = new Date(Number(key.split('/')[2]), Number(key.split('/')[1]) - 1, Number(key.split('/')[0]));
            conge.typeConge = form.value[key];
          }
        }
      }
      i++;
    }
    this.daysOffSelectedObjArr = [];
    this.ngOnInit();
  }

  countRTT() {
    let count = this.currentUser.rttn;
    for (let d of this.daysOffSelectedObjArr) {
      let half = d.demiJournee ? 3.5 : 7;
      if (d.typeConge == 'RTT') {
        count -= half;
      }
    }
    return count;
  }

  countConges() {
    let count = this.currentUser.cpNMoins1;
    let countAnciente = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
      let half = d.demiJournee ? 0.5 : 1;
      if (d.typeConge == 'Congés payés') {
        if (countAnciente - half <0){
          if(count-half<0){
            break;
          }
          count -= half;
        } else {
          countAnciente -=half;
        }
      }
    }
    if(count == 0 && this.countCongesAnticipes()==this.currentUser.cpN){
      this.allowAnticipation = false;
    }
    return count;
  }

  countAnciennete(){
    let count = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
        let half = d.demiJournee ? 0.5 : 1;
        if (d.typeConge == 'Congés payés') {
          if(count - half<0){
            break;
          }
          count -= half;
        }
      }
    return count;
  }

  countCongesAnticipes(){
    let count = this.currentUser.cpN;
    let countCPNmoins1 = this.currentUser.cpNMoins1;
    let countAnciente = this.currentUser.congeAnciennete;
    for (let d of this.daysOffSelectedObjArr) {
      let half = d.demiJournee ? 0.5 : 1;
      if (d.typeConge == 'Congés payés') {
        if (countAnciente - half <0){
          if(countCPNmoins1-half<0){
            if(this.allowAnticipation){
              if (count - half < 0){
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
          countAnciente -=half;
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

  handleFile(){
    console.log("handleFile");
    for(let i=0; i < this.inputFileComponent.files.length;i++) {
      var file = this.inputFileComponent.files[i];
      console.log (file.file.name,i);
      this.filename=file.file.name;
      if (file) {
        var reader = new FileReader();

        if (reader.readAsBinaryString === undefined) {
          reader.onload = this._handleReaderLoadedIE.bind(this);
          reader.readAsArrayBuffer(file.file);
        } else {
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file.file);
        }
        this.selectedFiles.splice(i,1)
        i--
      }
    }
  }

  _handleReaderLoadedIE(readerEvt) {
    console.log("_handleReaderLoadedIE");

    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = "";
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++)
      binary += String.fromCharCode(bytes[i]);
  }
  _handleReaderLoaded(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    console.log(readerEvt);
    console.log("_handleReaderLoaded");
    console.log(this.s(this.selectedFiles));
  }

}
