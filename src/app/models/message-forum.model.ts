import {UserModel} from './user.model';
import {ImageModel} from './image.model';

export class MessageForumModel {
  id: any;
  sujet: String;
  message: String;
  auteur: UserModel;
  type: String;
  categorie: string;
  valideAdmin: boolean;
  modifying:boolean = false;
  originId: number = 0;
  datePublication: Date;
  participants: UserModel[] = [];
  isParticipating: boolean;
  readByUserIds: String = "";
}
