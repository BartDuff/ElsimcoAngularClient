import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ContactModel} from '../models/contact.model';
import {CandidatService} from '../services/candidat.service';
import {saveAs} from 'file-saver';

import {ToastrService} from 'ngx-toastr';
import {CandidatModel} from '../models/candidat.model';
import {MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource, PageEvent} from '@angular/material';
import {Observable, Subject} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';
import {Diplome} from '../models/diplome.model';
import {hasProperties} from 'codelyzer/util/astQuery';
import {HttpHeaders} from '@angular/common/http';
import {ContactService} from '../services/contact.service';
import {Router} from '@angular/router';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-candidat-list',
  templateUrl: './candidat-list.component.html',
  styleUrls: ['./candidat-list.component.css']
})
export class CandidatListComponent implements OnInit, AfterViewInit {
  deleteRow = true;
  clickedRow = null;
  clickedColumn = null;
  selectedCivilite = "Monsieur";
  qCandidats;
  spinner = false;
  pageable = {size:3,number:0};
  totalPages = 1;
  size=10;
  paginator;
  topScrollbarWidth : any;
  qCandidatExemple = {};
  candidatFiltre = new CandidatModel();
  //editField: String;
  candidats: CandidatModel[];
  public ngUnsubscribe: Subject<void> = new Subject<void>();
  dataSource = new MatTableDataSource();
  columnsToIgnore = ['fileBase64', 'accepte', 'ficheProcess','ficheRecrutement','ficheProcessRecrutement','docsIds'];
  possibleValues = {
    'domaine1': ["Autres","Chimie","Cosmétique / Parfum","Cuir / Maro","Galva / TS","Horlogerie","Joaillerie / Bijoux","Lunetterie","Mécanique","Packaging","Pièces métalliques","Plasturgie","Textile maro","Textile PAP"],
    'domaine2': ["Autres","Chimie","Cosmétique / Parfum","Cuir / Maro","Galva / TS","Horlogerie","Joaillerie / Bijoux","Lunetterie","Mécanique","Packaging","Pièces métalliques","Plasturgie","Textile maro","Textile PAP"],
    'domaine3': ["Autres","Chimie","Cosmétique / Parfum","Cuir / Maro","Galva / TS","Horlogerie","Joaillerie / Bijoux","Lunetterie","Mécanique","Packaging","Pièces métalliques","Plasturgie","Textile maro","Textile PAP"],
    'metier1': ["Achat / Sourcing","Affaires règlementaires","Autres","R&D / Formulation","Conception","Design","Développement / Projet","Méthodes / Indus","Production / atelier","Qualité / Amélioration continue","Supply Chain / Logistique","CFAO / Programmation"],
    'metier2': ["Achat / Sourcing","Affaires règlementaires","Autres","R&D / Formulation","Conception","Design","Développement / Projet","Méthodes / Indus","Production / atelier","Qualité / Amélioration continue","Supply Chain / Logistique","CFAO / Programmation"],
    'metier3': ["Achat / Sourcing","Affaires règlementaires","Autres","R&D / Formulation","Conception","Design","Développement / Projet","Méthodes / Indus","Production / atelier","Qualité / Amélioration continue","Supply Chain / Logistique","CFAO / Programmation"],
    'outils1': ["Autres","Autres CAO / DAO","Catia","Creo / Pro E / Wildfire","Solidworks","Inventor","Autocad","Rhinoceros / Alias","Lectra","Mastercam / Top solid","MS Project","Windchill","Gitis","Linkit","Lean"],
    'outils2': ["Autres","Autres CAO / DAO","Catia","Creo / Pro E / Wildfire","Solidworks","Inventor","Autocad","Rhinoceros / Alias","Lectra","Mastercam / Top solid","MS Project","Windchill","Gitis","Linkit","Lean"],
    'outils3': ["Autres","Autres CAO / DAO","Catia","Creo / Pro E / Wildfire","Solidworks","Inventor","Autocad","Rhinoceros / Alias","Lectra","Mastercam / Top solid","MS Project","Windchill","Gitis","Linkit","Lean"],
    'experience': ["0 / 2 ans","Sup à 2 / 5 ans","Sup à 5 / 10 ans","Sup à 10 ans"],
    'enPoste': [true, false],
    'etatRecherches': ["En recherche active", "En veille", "En recherche", "Pas en recherche"],
    'contrat': ["CDI (PE validée)", "CDI (en PE)", "CDD", "Interim", "Formation", "Indépendant"],
    'mobiliteGeographique': [true, false],
    'mobiliteParis': [true, false],
    'mobiliteFrance': [true, false],
    'mobiliteEurope': [true, false],
    'mobiliteIntl': [true, false],
    'regionsFrance': [true, false],
    'region1': ['Auvergne-Rhône-Alpes',
      'Bourgogne-Franche-Comté',
      'Bretagne',
      'Centre-Val de Loire',
      'Corse',
      'Grand Est',
      'Hauts-de-France',
      'Normandie',
      'Nouvelle-Aquitaine',
      'Occitanie',
      'Pays de la Loire',
      'Provence-Alpes-Côte d\'Azur',
      'Non concerné'],
    'region2': ['Auvergne-Rhône-Alpes',
      'Bourgogne-Franche-Comté',
      'Bretagne',
      'Centre-Val de Loire',
      'Corse',
      'Grand Est',
      'Hauts-de-France',
      'Normandie',
      'Nouvelle-Aquitaine',
      'Occitanie',
      'Pays de la Loire',
      'Provence-Alpes-Côte d\'Azur',
      'Non concerné'],
    'fourchetteSalariale': ["moins de 30k","31 / 35k","36 / 40","41 / 45k","46 / 50k","Plus de 50k"],
    'anglais': ['','Débutant / Scolaire','Intermédiaire','Courant','Bilingue'],
    'italien': ['','Débutant / Scolaire','Intermédiaire','Courant','Bilingue'],
    'allemand': ['','Débutant / Scolaire','Intermédiaire','Courant','Bilingue'],
    'espagnol':['','Débutant / Scolaire','Intermédiaire','Courant','Bilingue'],
    'niveauAutrelangue': ['','Débutant / Scolaire','Intermédiaire','Courant','Bilingue']
  };

  columnsToDisplay = {
    'secretid':'Id Secret',
    'id':'Id',
    'nom':'Nom',
    'prenom': 'Prénom',
    'dateNaissance': 'Date de Naissance',
    'nationalite': 'Nationalité',
    'villeNaissance': 'Ville de Naissance',
    'departementNaissance': 'Département de Naissance',
    'skype': 'Identifiant Skype',
    'telDomicile': 'Téléphone domicile',
    'civilite':'Civilité',
    'posteRecherche': 'Poste Recherché',
    'spontane':'Candidature Spontanée',
    'accepte':'Conditions Acceptées',
    'permisB':'Permis B',
    'voiture':'Voiture',
    'permis2roues': 'Permis 2 roues',
    'deuxRoues': '2 roues',
    'anglais': 'Anglais',
    'italien': 'Italien',
    'allemand': 'Allemand',
    'espagnol': 'Espagnol',
    'autreLangue': 'Autre Langue',
    'niveauAutrelangue': 'Niveau autre langue',
    'regionsFrance':'Mobilité Région de France',
    'references':'Références',
    'statut': 'Statut',
    'sourceCv': 'Source du CV',
    'creePar':'Créé par',
    'dateCreation':'Date de création',
    'dateMAJ':'Date de mise à jour',
    'dateCandidature': 'Date de candidature',
    'fileName':'Nom du fichier',
    'fileType':'Type de fichier',
    'majPar':'Mis à jour par',
    'alerteMAJ':'Alerte des mises à jour',
    'commentairesCV':'Commentaires du CV',
    'experience':'Expérience',
    'tags':'Tags',
    'domaine1':'Domaine 1',
    'domaine2':'Domaine 2',
    'domaine3':'Domaine 3',
    'metier1':'Métier 1',
    'metier2':'Métier 2',
    'metier3':'Métier 3',
    'outils1':'Outils 1',
    'outils2':'Outils 2',
    'outils3':'Outils 3',
    'region1':'Région 1',
    'region2':'Région 2',
    'email': 'E-mail',
    'adresse': 'Adresse',
    'codePostal': 'Code postal',
    'ville': 'Ville',
    'mobile': 'Téléphone Mobile',
    'dateEnvoi': 'Date d\'envoi',
    'fileBase64': 'CV',
    'mobiliteParis': 'Mobilité Paris-IdF',
    'mobiliteFrance': 'Mobilité France Entière',
    'mobiliteEurope': 'Mobilité Europe',
    'mobiliteIntl': 'Mobilité Internationale',
    'reference1': 'Référence 1',
    'reference2': 'Référence 2',
    'diplome': 'Diplôme',
    'enPoste': 'En Poste?',
    'dateDispo': 'Date de disponibilité',
    'delai': 'Délai disponibilité',
    'preavisInitial':'Préavis Initial',
    'raisonDispo': 'Raison de l\'écoute',
    'preavisNegociable': 'Préavis négociable',
    'contrat': 'Contrat',
    'posteSouhaite': 'Poste souhaité',
    'evolution5ans': 'ëvolution souhaitée dans les 5 ans',
    'numSecu': 'Numéro INSEE',
    'fixeDernierSalaireBrut': 'Fixe du dernier salaire en brut',
    'varDernierSalaireBrut': 'Variable du dernier salaire en brut',
    'pretentionSalaireBrut': 'Prétentions salariales en brut',
    'fourchetteSalariale':'Fourchette Salariale',
    'autorisationControle':'Autorisation du contrôle de références',
    'dateDerniersEntretiens':'Date des derniers entretiens',
    'intitulePosteConcerne':'Intitulé du poste concerné',
    'fonctionEmployeurActuel':'Fonction chez l\'employeur actuel',
    'nombreAnneesExperiences':'Nombre d\'années d\'expérience',
    'raisonDepartSociete':'Raison du départ de la société',
    'etatRecherches':'Etat des recherches',
    'adequationPosteProfil':'Adéquation entre le poste et le profil',
    'mobiliteGeographique':'Mobilité géographique',
    'delaiDispoFiche':'Délai de disponibilité sur la Fiche',
    'faitA': 'Fait à:',
    'echangesEffectues': 'Echanges éffectués',
    'trigramme':'Trigramme'};
  columnsToFilter = [
    'id',
    'nom',
    'prenom',
    'domaine1',
    'domaine2',
    'domaine3',
    'metier1',
    'metier2',
    'metier3',
    'outils1',
    'outils2',
    'outils3',
    'experience',
    'enPoste',
    'etatRecherches',
    'contrat',
    // 'mobiliteGeographique',
    'mobiliteParis',
    'mobiliteFrance',
    'mobiliteEurope',
    'mobiliteIntl',
    'regionsFrance',
    'region1',
    'region2',
    'fourchetteSalariale',
    'anglais',
    'italien',
    'allemand',
    'espagnol',
    'autreLangue',
    'niveauAutrelangue',
    'tags',
    // 'delai',
    // 'fonctionEmployeurActuel',
    // 'nombreAnneesExperiences',
    // 'sourceCv',
    // 'commentairesCV'
  ];
  pageEvent: PageEvent;

  constructor(private candidatService: CandidatService,
              private contactService: ContactService,
              private router: Router,
              private toastrService: ToastrService,
              private cdRef:ChangeDetectorRef,
              private dialog: MatDialog) {
  }

  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  ngOnInit() {
    this.paginator = this.paginator1;
    this.getQCandidates();
    // this.dataSource.paginator = this.paginator;
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
        // this.pageable=data.pageable;
        this.totalPages = data.totalElements;
        if(this.qCandidats.length > 0){
          this.qCandidatExemple = this.qCandidats[0];
        } else {
          this.qCandidatExemple = new CandidatModel();
        }
        this.spinner = false;
        this.dataSource.data = this.qCandidats;
      }
    );
  }

  ngAfterViewInit()
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

  changePaginator(event){
    switch (event.index) {
      case 0:
        !this.dataSource.paginator ? this.dataSource.paginator = this.paginator : null;
        break;
      case 1:
        !this.dataSource.paginator ? this.dataSource.paginator = this.paginator2 : null;
        break;
    }
  }

  c(x){
    console.log(x);
  }


  getUniqueValues(key){
    let uniqueValues = [];
    for(let c of this.qCandidats){
      if(key == 'nom' || key == 'prenom' || key == 'id' || key == 'tags' || key == 'autreLangue'){
        if(uniqueValues.indexOf(c[key]) == -1){
          uniqueValues.push(c[key]);
        }
      } else {
        uniqueValues = this.possibleValues[key];
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

  // objectKeysFiltered(o){
  //   let ok = new Map();
  //   for (let k of Object.keys(o))
  //     if (this.columnsToFilter.indexOf(k) !=-1)
  //       ok.set(this.columnsToFilter[k], o[k]);
  //   return Array.from(ok.keys());
  // }

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

  deleteCandidat(candidat){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          const index = this.dataSource.data.indexOf(candidat);
          this.dataSource.data.splice(index, 1);
          this.dataSource._updateChangeSubscription();
          this.candidatService.deleteCandidat(candidat).subscribe(
            () => {
              this.toastrService.error('Candidat supprimé', 'Suppression effectuée');
            });
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

  addNewCandidateNoMail(){
    let candidat = new CandidatModel();
    candidat.diplome = new Diplome();
    candidat.diplome.annee = 0;
    candidat.dateDispo = new Date();
    candidat.contrat= "CDD";
    this.candidatService.addCandidatNoMail(candidat).subscribe(
      (c)=>{
        this.getQCandidates();
        this.toastrService.success("Candidat créé avec succès","Création");
      }
    )
  }

  envoyerDossier(email, civilite, nom){
    let contact = new ContactModel();
    contact.accepte = true;
    contact.email = email;
    contact.civilite = civilite;
    contact.nom = nom.toUpperCase();
    contact.spontane = false;
    this.contactService.addContactManual(contact).subscribe(
      (data) => {
        this.contactService.sendAcceptanceMail(contact.email, data).subscribe(
          ()=>{
            this.toastrService.success('Dossier de Candidature envoyé', 'Envoi');
          },
          ()=>{
            this.toastrService.error('Échec de l\'envoi', 'Échec');
          }
        );
      }
    )
  }

}


