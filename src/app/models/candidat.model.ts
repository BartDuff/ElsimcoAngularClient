import {ContactModel} from './contact.model';
import {Diplome} from './diplome.model';
import {Reference} from './reference.model';

export class CandidatModel extends ContactModel {

  constructor() {
    super();
  }
  dateNaissance: Date;
  nationalite: String;
  villeNaissance: String;
  departementNaissance: String;
  numSecu: String;
  skype: String;
  telDomicile: String;
  diplome: Diplome;
  permisB: boolean;
  voiture: boolean;
  permis2roues: boolean;
  deuxRoues: boolean;
  anglais: String;
  italien: String;
  allemand: String;
  espagnol: String;
  autreLangue: String;
  niveauAutrelangue: String;
  mobiliteParis: boolean;
  mobiliteFrance: boolean;
  mobiliteEurope: boolean;
  mobiliteIntl: boolean;
  references: Reference[];
  enPoste: boolean;
  contrat: String;
  preavisNegociable: boolean;
  delai: String;
  raisonDispo: String;
  posteSouhaite: String;
  evolution5ans: String;
  dateDispo: Date;
  fixeDernierSalaireBrut: number;
  varDernierSalaireBrut: number;
  pretentionSalaireBrut: number;
  faitA: String;
  adresse: String;
  codePostal: String;
  ville: String;
  dateEnvoi: Date;
  echangesEffectues:String;
}
