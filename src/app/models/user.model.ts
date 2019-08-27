import {MissionModel} from './mission.model';

export class UserModel {
  id: any;
  nom: String;
  prenom: String;
  email: String;
  dateInscription: Date;
  derniereConnexion: Date;
  role: String;
  fonction:String;
  missions: MissionModel[];

}
