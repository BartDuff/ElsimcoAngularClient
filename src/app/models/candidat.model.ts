import {ContactModel} from './contact.model';
import {Diplome} from './diplome.model';
import {Reference} from './reference.model';
import {UserModel} from './user.model';

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
  regionsFrance: String;
  mobiliteEurope: boolean;
  mobiliteIntl: boolean;
  references: Reference[];
  enPoste: boolean;
  contrat: String;
  preavisNegociable: String;
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
  creePar: String;
  dateCreation: Date;
  statut:String;
  sourceCv:String;
  dateMAJ: Date;
  majPar: String;
  alerteMAJ: Date;
  commentairesCV: String;
  experience: String;
  tags: String;
  domaine1: String;
  domaine2: String;
  domaine3: String;
  metier1: String;
  metier2: String;
  metier3: String;
  outils1: String;
  outils2: String;
  outils3: String;
  fourchetteSalariale: String;
  region1: String;
  region2: String;
  autorisationControle: boolean;
  dateDerniersEntretiens: Date;
  intitulePosteConcerne: String;
  fonctionEmployeurActuel: String;
  nombreAnneesExperiences: number;
  raisonDepartSociete: String;
  etatRecherches: String;
  adequationPosteProfil: String;
  mobiliteGeographique: String;
  delaiDispoFiche: String;
  ficheProcess: String;
  ficheRecrutement: String;
  docsIds: String = "";
}
