import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {saveAs} from 'file-saver';
import {FicheModel} from '../models/fiche.model';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {PdfService} from '../services/pdf.service';
import {FicheService} from '../services/fiche.service';
import {CommentDialogComponent} from '../dialog/comment-dialog/comment-dialog.component';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-fiche-list',
  templateUrl: './fiche-list.component.html',
  styleUrls: ['./fiche-list.component.css']
})
export class FicheListComponent implements OnInit {
  currentUser:UserModel;
  fiches: FicheModel[];
  allFiches: FicheModel[];
  allRHValidFiches: FicheModel[];
  constructor(private userService: UserService,
              private ficheService: FicheService,
              private pdfService:PdfService,
              private toastrService:ToastrService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getFichesForUser();
    this.getAllFiches();
    this.getAllValidRHFiches();
  }

  getFichesForUser() {
    this.userService.getFicheForUser(this.currentUser).subscribe(
      (data) => {this.fiches = data;
      console.log(data);}
    );
  }

  getAllFiches() {
    this.ficheService.getFiches().subscribe(
      (data) => {this.allFiches = data;}
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


  downloadDocument(ficheToDownload: FicheModel) {
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    this.pdfService.downloadFiche(ficheToDownload.id).subscribe(
      (res) => {
        // let blob = new Blob([res],{type:"application/octet-stream"});
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
        // if(!navigator.userAgent.match('CriOS')) {
        //   saveAs(res, ficheToDownload.uri);
        // } else {
        //   let reader = new FileReader();
        //   reader.onload = function(e){
        //     window.location.href = reader.result
        //   };
        //   reader.readAsDataURL(res);
        // }
        this.toastrService.success("Téléchargé", "Téléchargé")},
      (err) => {
        console.log(err);
        this.toastrService.error("Erreur", "Erreur de téléchargement");
      }
    )
  }

  openDocument(fiche: FicheModel) {
    this.pdfService.openFiche(fiche.id).subscribe(
      (res) => {
        // let blob = this.base64ToBlob(d.fileBase64, 'application/' + d.originalFileName.split('.'[2]));
        // let reader = new FileReader();
        // reader.onload = function (e) {
        //   window.location.href = reader.result
        // };
        // reader.readAsDataURL(blob);
        // window.open("data:application/" + d.originalFileName.split('.')[2]+ ";base64, "+d.fileBase64, '_blank');
        // let blob = this.base64ToBlob(d.fileBase64, 'application/' + d.originalFileName.split('.')[d.originalFileName.split('.').length-1]);
        let blob = new Blob([res],{type:"application/pdf"});
        let fileURL = window.URL.createObjectURL(blob);
        let tab = window.open();
        // if(d.originalFileName.split('.')[d.originalFileName.split('.').length-1] == 'pdf'){
        tab.location.href = fileURL;
        // } else {
        //   // tab.onload = function(){this.document.body.innerHTML+= `<iframe src= "https://view.officeapps.live.com/op/embed.aspx?src=${fileURL}" width="100%" height="800"> </iframe>`};
        //   let newblob = new Blob([blob], {type:"text/plain;charset=utf-8"});
        //   let newFileURL = URL.createObjectURL(newblob);
        //   tab.location.href = newFileURL;
        // }
      });
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
  }
}
