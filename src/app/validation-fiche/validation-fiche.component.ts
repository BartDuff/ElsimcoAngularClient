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

@Component({
  selector: 'app-validation-fiche',
  templateUrl: './validation-fiche.component.html',
  styleUrls: ['./validation-fiche.component.css']
})
export class ValidationFicheComponent implements OnInit {
  currentUser:UserModel;
  allFiches: FicheModel[];
  allRHValidFiches: FicheModel[];
  dateNow : Date;
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

  getAllFiches() {
    this.allFiches = [];
    this.ficheService.getFiches().subscribe(
      (data) => {
        for(let f of data){
          if(f.mois == this.nomsDesMois[this.dateNow.getMonth()] && f.annee === this.dateNow.getFullYear())
            this.allFiches.push(f);
          // else
          //   this.allFiches.splice(this.allFiches.indexOf(f),1);
        }
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
    this.pdfService.downloadFiche(ficheToDownload.id).subscribe(
      (res) => {
        // let blob = new Blob([res],{type:"application/octet-stream"});
        saveAs(res, ficheToDownload.uri);
        this.toastrService.success("Téléchargé", "Téléchargé")},
      (err) => {
        console.log(err);
        this.toastrService.error("Erreur", "Erreur de téléchargement");
      }
    )
  }
}
