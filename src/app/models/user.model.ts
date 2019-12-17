import {MissionModel} from './mission.model';

export class UserModel {
  id: any;
  nom: String;
  prenom: String;
  email: String;
  trigramme: String;
  adressePostale: String;
  telephone: String;
  telPro: String;
  emailPerso: String;
  cpNMoins1: number;
  cpN: number;
  rttn: number;
  congeAnciennete: number;
  dateInscription: Date;
  dateArrivee: Date;
  dateDepart: Date;
  metier: String;
  avatar: String;
  avatarType: String;
  rawFile: any;
  derniereConnexion: Date;
  role: String;
  fonction:String;
  missions: MissionModel[];

}
