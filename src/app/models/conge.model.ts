import {UserModel} from './user.model';

export class CongeModel {

  id: number;
  date: Date;
  demiJournee: boolean;
  typeDemiJournee: String;
  typeConge: String;
  typeCe: String;
  documentJointUri: String;
  documentJointType: String;
  valideRH: boolean;
  user: UserModel;
  commentaires: String;
  justificatifRecu: boolean;
}
