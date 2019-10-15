import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ContactModel} from '../models/contact.model';
import {CandidatService} from '../services/candidat.service';
import {saveAs} from 'file-saver';

import {ToastrService} from 'ngx-toastr';
import {CandidatModel} from '../models/candidat.model';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Diplome} from '../models/diplome.model';
import {hasProperties} from 'codelyzer/util/astQuery';

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
  pageable = {size:3,number:1};
  totalPages = 1;
  size=10;
  qCandidatExemple = {};
  candidatFiltre = new CandidatModel();
  //editField: String;
  candidats: CandidatModel[];
  public ngUnsubscribe: Subject<void> = new Subject<void>();
  dataSource: any;
  columnsToIgnore = ['secretid', 'fileBase64', 'accepte', 'ficheProcess','ficheRecrutement','ficheProcessRecrutement'];
  columnsToDisplay = {
    'id':'Id',
    'secretid':'Id Secret',
    'nom':'Nom',
    'prenom': 'Prénom',
    'dateNaissance': 'Date de Naissance',
    'nationalite': 'Nationalité',
    'villeNaissance': 'Ville de Naissance',
    'departementNaissance': 'Département de Naissance',
    'skype': 'Identifiant Skype',
    'telDomicile': 'Téléphone domicile',
    'posteRecherche':'Poste(s) Recherché(s)',
    'permisB':'Permis B',
    'voiture':'Voiture',
    'permis2roues': 'Permis 2 roues',
    'deuxRoues': '2 roues',
    'anglais': 'Anglais',
    'italien': 'Italien',
    'allemand': 'Allemand',
    'espagnol': 'Espagnol',
    'autreLangue': 'Autre Langue',
    'email': 'E-mail',
    'adresse': 'Adresse',
    'codePostal': 'Code postal',
    'ville': 'Ville',
    'mobile': 'Téléphone Mobile',
    'dateEnvoi': 'Date d\'envoi',
    'fileBase64': 'CV',
    'mobiliteParis': 'Mobilité Paris-IdF',
    'mobiliteFrance': 'Mobilité France',
    'mobiliteEurope': 'Mobilité Europe',
    'mobiliteIntl': 'Mobilité Internationale',
    'reference1': 'Référence 1',
    'reference2': 'Référence 2',
    'diplome': 'Diplôme',
    'enPoste': 'En Poste?',
    'dateDispo': 'Date de disponibilité',
    'delai': 'Délai disponibilité',
    'raisonDispo': 'Raison de l\'écoute',
    'preavisNegociable': 'Préavis négociable',
    'contrat': 'Contrat',
    'posteSouhaite': 'Poste souhaité',
    'evolution5ans': 'Évolution souhaitée dans les 5 ans',
    'numSecu': 'Numéro INSEE',
    'fixeDernierSalaireBrut': 'Fixe du dernier salaire en brut',
    'varDernierSalaireBrut': 'Variable du dernier salaire en brut',
    'pretentionSalaireBrut': 'Prétentions salariales en brut',
    'faitA': 'Fait à:',
    'echangesEffectues': 'Echanges éffectués'};


  constructor(private candidatService: CandidatService,
              private toastrService: ToastrService,
              private cdRef:ChangeDetectorRef,) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.getQCandidates();
    //this.getCandidates();
  }

  getQCandidates(){
    this.spinner=true;
    this.ngUnsubscribe.next();

    this.candidatService.getQCandidats(this.candidatFiltre, this.pageable,this.size)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
      (data)=> {
        this.qCandidats = data.content;
        //this.pageable=data.pageable;
        this.totalPages = data.totalElements;
        this.qCandidatExemple = this.qCandidats[0];
        this.spinner = false;
        this.dataSource = new MatTableDataSource(this.qCandidats);
        this.dataSource.paginator = this.paginator;
      }
    );
  }

  ngAfterViewChecked()
  {
    this.cdRef.detectChanges();
    this.paginator.page.subscribe(
      (data) => {
        this.pageable.number = data.pageIndex;
        this.size = this.paginator.pageSize;
        this.getQCandidates();
      }
    )
  }

  getUniqueValues(key){
    let uniqueValues = [];
    for(let c of this.qCandidats){
      if(uniqueValues.indexOf(c[key]) == -1){
        uniqueValues.push(c[key]);
      }
    }
    return uniqueValues;
  }

  getCandidates() {
    this.candidatService.getCandidats().subscribe(
      (data) => {
        this.dataSource = new MatTableDataSource(data.content);
        this.candidats = data.content;
        this.pageable=data.pageable;
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
  s(ss){
    return JSON.stringify(ss,null,4)
  }

  objectKeys(o){
    let ok = [];
    for (let k of Object.keys(o))
      if (this.columnsToIgnore.indexOf(k) ==-1)
        ok.push(k);
    return ok;
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
    this.candidatService.getCandidat(contactCV.id).subscribe(
      (res) => {
        let c: ContactModel = res;
        //console.log(c);
        if (c.fileBase64) {
          let blob = this.base64ToBlob(c.fileBase64);
          saveAs(blob, `${contactCV.prenom} ${contactCV.nom}_CV.pdf`);
        }
      });
  }

  // cellClicked(row, column) {
  //   let clicked = this.clickedColumn === this.columnsToDisplay.indexOf(column) && this.clickedRow === row.id;
  //   return clicked;
  // }
  //
  // checkClickedColumn(element){
  //   this.clickedColumn = this.columnsToDisplay.indexOf(element);
  // }

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


