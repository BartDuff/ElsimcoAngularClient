import {UserModel} from './user.model';
import {ImageModel} from './image.model';

export class MessageForumModel {
  id: any;
  sujet: String;
  message: String;
  auteur: UserModel;
  type: String;
  originId: number;
  datePublication: Date;
}
