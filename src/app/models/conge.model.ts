import {UserModel} from './user.model';

export class CongeModel {

  id: number;
  date: Date;
  demiJournee: boolean;
  typeDemiJournee: String;
  typeConge: String;
  typeConge2: String;
  typeCe: String;
  fileId: number;
  documentJointUri: String;
  documentJointType: String;
  valideRH: boolean;
  user: UserModel;
  commentaires: String;
  justificatifRecu: boolean;
}
