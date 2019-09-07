import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {CandidatService} from '../services/candidat.service';
import {CandidatModel} from '../models/candidat.model';

@Component({
  selector: 'app-candidat-details',
  templateUrl: './candidat-details.component.html',
  styleUrls: ['./candidat-details.component.css']
})
export class CandidatDetailsComponent implements OnInit {

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
  listeRegions = [ "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur"];

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private candidatService: CandidatService) { }

  objectKeys(o){
    return Object.keys(o);
  }

  ngOnInit() {
    this.formulaire = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      dateNaissance: [''],
      skype:[''],
      email: ['', [Validators.email, Validators.required]],
      codePostal: ['', [Validators.required, Validators.pattern('^(([0-8][0-9])|(9[0-5]))[0-9]{3}$')]],
      ville: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      mobile: ['',[Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
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

  onSubmit(){

  }

  updateModel(candidat: CandidatModel) {
    this.candidatService.editCandidat(candidat).subscribe(
      (data) => {

      }
    );
  }
}
