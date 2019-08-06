import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ContactModel} from '../models/contact.model';
import {CandidatService} from '../services/candidat.service';
import {saveAs} from 'file-saver';

import {ToastrService} from 'ngx-toastr';
import {CandidatModel} from '../models/candidat.model';
import {MatTableDataSource} from '@angular/material';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Diplome} from '../models/diplome.model';

@Component({
  selector: 'app-candidat-list',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewChecked {
  clickedRow = null;
  clickedColumn = null;
  qCandidats;
  spinner = false;
  qCandidatExemple = {};
  candidatFiltre = new CandidatModel();
  //editField: String;
  candidats: CandidatModel[];
  public ngUnsubscribe: Subject<void> = new Subject<void>();
  dataSource: any;
  columnsToDisplay = ['nom', 'prenom', 'dateNaissance', 'nationalite', 'villeNaissance', 'departementNaissance', 'skype', 'telDomicile', 'permisB', 'voiture', 'permis2roues', 'deuxRoues', 'anglais', 'italien', 'allemand', 'espagnol', 'autreLangue', 'email', 'adresse', 'codePostal', 'ville', 'mobile', 'dateEnvoi', 'fileBase64',
    'mobiliteParis', 'mobiliteFrance', 'mobiliteEurope', 'mobiliteIntl', 'reference1', 'reference2', 'diplome', 'enPoste', 'dateDispo', 'delai', 'raisonDispo', 'preavisNegociable', 'contrat', 'posteSouhaite', 'evolution5ans', 'numSecu', 'fixeDernierSalaireBrut', 'varDernierSalaireBrut', 'pretentionSalaireBrut', 'faitA', 'echangesEffectues'];


  constructor(private candidatService: CandidatService,
              private toastrService: ToastrService,
              private cdRef:ChangeDetectorRef,) {
  }

  ngOnInit() {
    this.getQCandidates();
    this.getCandidates();
  }

  getQCandidates(){
    this.spinner=true;
    this.ngUnsubscribe.next();

    this.candidatService.getQCandidats(this.candidatFiltre)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
      (data)=> {
        this.qCandidats = data;
        this.qCandidatExemple = this.qCandidats[0];
        this.spinner = false;
      }
    );
  }

  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
  }

  getCandidates() {
    this.candidatService.getCandidats().subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.candidats = data;
      }
    );
  }

  ss(o){
    let s = "";
    if(!o)
      return "";
    if(typeof o === 'object'){
      for(let k of Object.keys(o))
        s += o[k] + '\n';
      return s;
    }
    return o;
  }

  objectKeys(o){
    return Object.keys(o);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  updateModel(candidat: CandidatModel) {
    this.candidatService.editCandidat(candidat).subscribe(
      (data) => {
      }
    );
  }

  downloadCV(contactCV: ContactModel) {
    this.candidatService.getCandidant(contactCV.id).subscribe(
      (res) => {
        let c: ContactModel = res;
        //console.log(c);
        if (c.fileBase64) {
          let blob = this.base64ToBlob(c.fileBase64);
          saveAs(blob, `${contactCV.prenom} ${contactCV.nom}_CV.pdf`);
        }
      });
  }

  cellClicked(row, column) {
    let clicked = this.clickedColumn === this.columnsToDisplay.indexOf(column) && this.clickedRow === row.id;
    return clicked;
  }

  checkClickedColumn(element){
    this.clickedColumn = this.columnsToDisplay.indexOf(element);
  }

  checkClickedRow(element){
    this.clickedRow = element.id;
  }

  resetRowAndColumnsClick(){
    this.clickedRow = null;
    this.clickedColumn = null;
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
