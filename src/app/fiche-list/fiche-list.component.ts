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
              private toastrService:ToastrService,
              private dialog: MatDialog) { }

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
      (data) => {this.allFiches = data;
        console.log(data);}
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
