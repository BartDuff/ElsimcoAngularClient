import {MissionModel} from './mission.model';

export class UserModel {
  id: any;
  nom: String;
  prenom: String;
  email: String;
  trigramme: String;
  cpNMoins1: number;
  cpN: number;
  rttn: number;
  dateInscription: Date;
  derniereConnexion: Date;
  role: String;
  fonction:String;
  missions: MissionModel[];

}
