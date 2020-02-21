import {MissionModel} from './mission.model';
import {NewsModel} from './news.model';

export class UserModel {
  id: any;
  nom: String;
  prenom: String;
  email: String;
  trigramme: String;
  adressePostale: String;
  codePostal: String;
  ville: String;
  telephone: String;
  telPro: String;
  emailPerso: String;
  cpNMoins1: number;
  cpN: number;
  rttn: number;
  anticipation:number;
  congeAnciennete: number;
  dateInscription: Date;
  dateArrivee: Date;
  dateDepart: Date;
  metier: String;
  imageId: number;
  competenceId: number;
  avatar: String;
  avatarType: String;
  rawFile: any;
  competenceFile: any;
  derniereConnexion: Date;
  role: String;
  fonction:String;
  statut:String;
  missions: MissionModel[];
  likes: NewsModel[];
}
