import {UserModel} from './user.model';

export class CongeModel {

  id: number;
  date: Date;
  demiJournee: boolean;
  typeDemiJournee: String;
  typeConge: String;
  typeCe: String;
  documentJointUri: String;
  valideRH: boolean;
  user: UserModel;
  commentaires: String;

}
