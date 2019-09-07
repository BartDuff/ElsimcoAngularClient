import {Component, OnInit} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {saveAs} from 'file-saver';
import {FicheModel} from '../models/fiche.model';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {PdfService} from '../services/pdf.service';

@Component({
  selector: 'app-fiche-list',
  templateUrl: './fiche-list.component.html',
  styleUrls: ['./fiche-list.component.css']
})
export class FicheListComponent implements OnInit {
  currentUser:UserModel;
  fiches: FicheModel[];
  constructor(private userService: UserService,
              private pdfService:PdfService,
              private toastrService:ToastrService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getFichesForUser();
  }

  getFichesForUser() {
    this.userService.getFicheForUser(this.currentUser).subscribe(
      (data) => {this.fiches = data;
      console.log(data);}
    );
  }

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
