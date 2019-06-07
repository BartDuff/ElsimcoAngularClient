import {MissionModel} from './mission.model';

export class UserModel {
  id: any;
  nom: String;
  prenom: String;
  email: String;
  dateInscription: Date;
  role: String;
  missions: MissionModel[];
}
