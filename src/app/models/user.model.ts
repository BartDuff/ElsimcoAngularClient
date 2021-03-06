import {MissionModel} from './mission.model';
import {NewsModel} from './news.model';
import {SafeResourceUrl} from '@angular/platform-browser';
import {MessageForumModel} from './message-forum.model';

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
  actif:boolean;
  cpNMoins1: number;
  cpN: number;
  rttn: number;
  anticipation:number;
  congeAnciennete: number;
  dateInscription: Date;
  dateArrivee: Date;
  dateDepart: Date;
  dateNaissance: Date;
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
  participating: MessageForumModel[];
  img:SafeResourceUrl;
}
