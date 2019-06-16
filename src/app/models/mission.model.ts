import {UserModel} from './user.model';

export class MissionModel {
  id: any;
  intitule: String;
  client: String;
  resume: String;
  duree: number;
  datePublication: Date;
  status: number;
  lu:boolean;
  jobDesc: String;
  users: UserModel[];
}
