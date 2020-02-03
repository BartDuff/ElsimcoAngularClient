import { Component, OnInit } from '@angular/core';
import {UserModel} from '../models/user.model';
import {FicheModel} from '../models/fiche.model';
import {saveAs} from 'file-saver';
import {UserService} from '../services/user.service';
import {FicheService} from '../services/fiche.service';
import {PdfService} from '../services/pdf.service';
import {ToastrService} from 'ngx-toastr';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {CommentDialogComponent} from '../dialog/comment-dialog/comment-dialog.component';
import * as moment from 'moment';
import {ValidationCongesComponent} from '../validation-conges/validation-conges.component';

@Component({
  selector: 'app-validation-fiche',
  templateUrl: './validation-fiche.component.html',
  styleUrls: ['./validation-fiche.component.css']
})
export class ValidationFicheComponent implements OnInit {
  currentUser:UserModel;
  allFiches: FicheModel[]=[];
  allRHValidFiches: FicheModel[];
  dateNow : Date;
  dataSource: any;
  loading = false;
  nomsDesMois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] ;
  constructor(private userService: UserService,
              private ficheService: FicheService,
              private pdfService:PdfService,
              private toastrService:ToastrService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getAllFiches();
    this.getAllValidRHFiches();
    this.dateNow = new Date();
  }

    objectKeys(o){
      let ok = [];
      if(o == null){
        return ok;
      }
      for (let k of Object.keys(o))
          ok.push(k);
      return ok;
  }

  s(o){
    JSON.stringify(o);
  }

  c(o){
    console.log(o);
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }

  getAllFiches() {
    // this.allFiches = [];
    this.loading = true;
    this.ficheService.getFiches().subscribe(
      (data) => {
        for(let f of data){
          if(f.mois == this.nomsDesMois[this.dateNow.getMonth()] && f.annee === this.dateNow.getFullYear())
            this.allFiches.push(f);
          // else
          //   this.allFiches.splice(this.allFiches.indexOf(f),1);
        }
        this.loading = false;
      }
    );
  }

  getAllValidRHFiches() {
    this.ficheService.getFiches().subscribe(
      (data) => {
        this.allRHValidFiches = data;
        this.allRHValidFiches = this.allRHValidFiches.filter(function (value) {
          return value.valideRH === true;
        })
      }
    );
  }

  validateFicheRH(fiche: FicheModel){
    fiche.valideRH = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data)=>{
        if(data){
          this.ficheService.editFiche(fiche).subscribe(
            (data)=> {
              this.getAllFiches();
              this.toastrService.success('Fiche de présence validée', 'Fiche validée');
            }
          )
        }
      }
    );
  }


  refuseFicheRH(fiche: FicheModel){
    fiche.valideRH = false;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(CommentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data)=>{
        this.ficheService.sendComment(fiche.user,data.commentaire).subscribe(
          (d)=>{
            this.ficheService.deleteFiche(fiche).subscribe(
              (d)=> {
                this.getAllFiches();
                this.toastrService.error('Fiche de présence refusée', 'Fiche refusée');
              }
            )}
        )}
    );
  }



  // validateFicheDir(fiche: FicheModel){
  //   fiche.valideDir = true;
  //   this.ficheService.editFiche(fiche).subscribe(
  //     (data)=> {
  //       this.getAllFiches();
  //       this.toastrService.success('Fiche de présence validée', 'Fiche validée');
  //     }
  //   )
  // }


  downloadDocument(ficheToDownload: FicheModel) {
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    this.pdfService.downloadFiche(ficheToDownload.id).subscribe(
      (res) => {
        // let blob = new Blob([res],{type:"application/octet-stream"});
        // if(!navigator.userAgent.match('CriOS')) {
        //   saveAs(res, ficheToDownload.uri);
        // } else {
        //   let reader = new FileReader();
        //   reader.onload = function(e){
        //     window.location.href = reader.result
        //   };
        // }
        // let blob = this.base64ToBlob(d.fileBase64, 'application/'+ d.originalFileName.split('.'[2]));
        if(!navigator.userAgent.match('CriOS') || !isSafari) {
          saveAs(res, ficheToDownload.uri);
        } else {
          // let reader = new FileReader();
          // reader.onload = function(e){
          //   window.location.href = reader.result
          // };
          // reader.readAsDataURL(blob);
          window.open(URL.createObjectURL(res));
        }
        this.toastrService.success("Téléchargé", "Téléchargé")},
      (err) => {
        console.log(err);
        this.toastrService.error("Erreur", "Erreur de téléchargement");
      }
    )
  }

  toDate(s) {
    return new Date(s.substr(6, 4), s.substr(3, 2) - 1, s.substr(0, 2));
  }

  isArray(a) {
    return Array.isArray(a);
  }

  getCP(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Congés payés'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    // return arr.sort((a, b) => this.toDate(a).valueOf() - this.toDate(b).valueOf());
    return this.splitArrayInRanges(arr);
  }

  getRTT(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'RTT'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);
  }

  getMaladie(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Arrêt maladie'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);
  }

  getCSS(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Congés sans solde'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);
  }

  getAbsences(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Absence Exceptionnelle'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);
  }

  getFormation(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Formation'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);

  }

  getIntercontrat(ob){
    let arr = [];
    for(let k of Object.keys(ob)){
      let date = k.substr(k.length-10,10);
      let typeConge = k.substr(0,k.length-11);
      if(typeConge == 'Intercontrat'){
        arr.push(date);
      }
    }
    if(arr.length == 0){
      return arr;
    }
    return this.splitArrayInRanges(arr);
  }

  splitArrayInRanges(arr) {
    let newArr = [];
    let plage = [];
    arr.sort((a, b) => this.toDate(a).valueOf() - this.toDate(b).valueOf());
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) {
        if (this.isFollowingDay(arr[i - 1], arr[i])) {
          plage.push(arr[i]);
          if (i == arr.length - 1 || !(this.isFollowingDay(arr[i], arr[i + 1]))) {
            newArr.push(plage);
            plage = [];
          }
        } else {
          if (i != arr.length - 1) {
            if (this.isFollowingDay(arr[i], arr[i + 1])) {
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
          if (this.isFollowingDay(arr[i], arr[i + 1])) {
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

  checkWeekendsWithYear(day: Date, year) {
    let d = day.toLocaleString('fr-FR', {weekday: 'short'});
    return d === 'dim.' || d === 'sam.' || ValidationFicheComponent.joursFeries(year).includes(moment(day).format('DD/MM/YYYY').toString());
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
}
