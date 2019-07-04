import { Component, OnInit } from '@angular/core';
import {ContactModel} from '../models/contact.model';
import {CandidatService} from '../services/candidat.service';
import { saveAs } from 'file-saver';

import {ToastrService} from 'ngx-toastr';
import {CandidatModel} from '../models/candidat.model';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-candidat-list',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit {
  editField: String;
  candidats: CandidatModel[];
  dataSource:any;
  columnsToDisplay = ['nom', 'prenom', 'email', 'adresse', 'codePostal', 'ville', 'mobile', 'dateEnvoi', 'fileBase64',
    'mobilite', 'competences', 'diplome', 'disponibilite','domaine', 'numSecu', 'salaireActuelBrut', 'situationActuelle','experience','echangesEffectues']
  constructor(private candidatService: CandidatService,
              private toastrService:ToastrService) { }

  ngOnInit() {
    this.getCandidates();
  }

  getCandidates() {
    this.candidatService.getCandidats().subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.candidats = data;
      }
    );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  downloadCV(contactCV: ContactModel) {
    this.candidatService.getCandidant(contactCV.id).subscribe(
      (res) => {
        let c : ContactModel = res ;
        console.log(c);
        if (c.fileBase64) {
          let blob = this.base64ToBlob(c.fileBase64);
          saveAs(blob, `${contactCV.prenom} ${contactCV.nom}_CV.pdf`);
        }
      });
  }

  public base64ToBlob(b64Data, contentType='', sliceSize=512) {
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

  changeValue(id: number, property: string, event: any){
    this.editField = event.target.textContent;
  }

  updateList(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
    this.candidats[id][property] = this.editField;
  }
}
