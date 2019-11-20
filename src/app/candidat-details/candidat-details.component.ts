import {Component, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {saveAs} from 'file-saver';
import {CandidatService} from '../services/candidat.service';
import {CandidatModel} from '../models/candidat.model';
import htmlToImage from 'html-to-image';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-candidat-details',
  templateUrl: './candidat-details.component.html',
  styleUrls: ['./candidat-details.component.css']
})
export class CandidatDetailsComponent implements OnInit {
  clickedColumn = null;
  envBase = environment.base;
  formulaire: FormGroup;
  formulaire2: FormGroup;
  formulaire3: FormGroup;
  formulaire4: FormGroup;
  formulaire5: FormGroup;
  formulaire6: FormGroup;
  formulaire7: FormGroup;
  formulaire8: FormGroup;
  candidat?: CandidatModel;
  listeRegions = ['Auvergne-Rhône-Alpes',
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
    'Provence-Alpes-Côte d\'Azur'];

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
    'posteRecherche': 'Poste Recherché',
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
    'echangesEffectues': 'Echanges éffectués'};

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private candidatService: CandidatService,
              private toastrService: ToastrService) {
  }

  objectKeys(o) {
    return Object.keys(o);
  }

  checkClickedRow(row: String) {
    return true;
  }

  cellClicked(candidat: CandidatModel, cell: String) {
    return true;
  }

  ngOnInit() {
    this.formulaire = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      dateNaissance: [''],
      skype: [''],
      email: ['', [Validators.email, Validators.required]],
      codePostal: ['', [Validators.required, Validators.pattern('^(([0-8][0-9])|(9[0-5]))[0-9]{3}$')]],
      ville: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      mobile: ['', [Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
    });
    this.formulaire2 = this.formBuilder.group({
      creePar: [''],
      dateCreation: [''],
    });
    this.formulaire3 = this.formBuilder.group({
      statut: [''],
      sourceCV: [''],
    });
    this.formulaire4 = this.formBuilder.group({
      cvJoint: [''],
      dateMAJ: [''],
      majPar: [''],
      alerteMAJ: [''],
      commentairesCV: [''],

    });
    this.formulaire5 = this.formBuilder.group({
      enPoste: [''],
      contrat: [''],
      raisonDispo: [''],
      posteSouhaite: [''],
      delai: [''],
      dateDispo: ['']
    });
    this.formulaire6 = this.formBuilder.group({
      experience: [''],
      tags: [''],
    });
    this.formulaire7 = this.formBuilder.group({
      domaine1: [''],
      domaine2: [''],
      domaine3: [''],
      metier1: [''],
      metier2: [''],
      metier3: [''],
      outils1: [''],
      outils2: [''],
      outils3: [''],
      anglais: [''],
      italien: [''],
      allemand: [''],
      espagnol: [''],
      autreLangue: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      niveauAutreLangue: ['']
    });
    this.formulaire8 = this.formBuilder.group({
      fixeDernierSalaireBrut: [''],
      varDernierSalaireBrut: [''],
      fourchetteSalariale: [''],
      mobiliteGeographique: [''],
      region1: [''],
      region2: ['']
    });
    this.route.params.subscribe(
      params => this.candidatService.getCandidat(params['id']).subscribe(
        data => {
          this.candidat = data;
        }
      )
    );
  }

  onSubmit() {

  }

  updateModel(candidat: CandidatModel) {
    this.candidatService.editCandidat(candidat).subscribe(
      (data) => {

      }
    );
  }

  generateProcessDocument(candidat: CandidatModel) {
    let table = document.getElementById('ficheProcess');
    htmlToImage.toPng(table, {}).then((image) => {
      candidat.ficheProcess = image;
      this.candidatService.editCandidat(candidat).subscribe(
        () => {
          this.candidatService.downloadFicheProcess(candidat.id).subscribe(
            (res) => {
              console.log(res);
              saveAs(res, 'FicheProcess_' + candidat.prenom + '_' + candidat.nom + '.pdf');
              this.toastrService.success('Téléchargé', 'Téléchargé');
            },
            (err) => {
              console.log(err);
              this.toastrService.error('Erreur', 'Erreur de téléchargement');
            }
          );
        });
    });
  }

  generateRecruitmentDocument(candidat: CandidatModel) {
    let table = document.getElementById('ficheRecrutement');
    htmlToImage.toPng(table, {}).then((image) => {
      candidat.ficheRecrutement = image;
      this.candidatService.editCandidat(candidat).subscribe(
        () => {
          this.candidatService.downloadFicheRecrutement(candidat.id).subscribe(
            (res) => {
              console.log(res);
              saveAs(res, 'FicheRecrutement_' + candidat.prenom + '_' + candidat.nom + '.pdf');
              this.toastrService.success('Téléchargé', 'Téléchargé');
            },
            (err) => {
              console.log(err);
              this.toastrService.error('Erreur', 'Erreur de téléchargement');
            }
          );
        });
    });
  }

  generateProcessRecruitementDocument(candidat: CandidatModel) {
    this.candidatService.downloadFicheProcessRecrutement(candidat.id).subscribe(
      (res) => {
        console.log(res);
        saveAs(res, 'FicheHybride' + candidat.prenom + '_' + candidat.nom + '.pdf');
        this.toastrService.success('Téléchargé', 'Téléchargé');
      },
      (err) => {
        console.log(err);
        this.toastrService.error('Erreur', 'Erreur de téléchargement');
      }
    );
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
