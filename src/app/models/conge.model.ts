import {UserModel} from './user.model';

export class CongeModel {

  id: number;
  date: Date;
  demiJournee: boolean;
  typeDemiJournee: String;
  typeConge: String;
  typeCE: String;
  documentJointUri: String;
  valideRH: boolean;
  user: UserModel;
  commentaires: String;

}
