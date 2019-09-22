import {UserModel} from './user.model';

export class CongeModel {

  id: number;
  date: Date;
  demiJournee: boolean;
  typeConge: String;
  documentJointUri: String;
  valideRH: boolean;
  user: UserModel;
  commentaires: String;

}
