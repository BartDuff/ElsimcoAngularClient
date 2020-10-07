import {UserModel} from './user.model';

export class NotificationModel {
  id:number;
  sujet: String;
  message: String;
  lu:boolean;
  user: UserModel;
  datePublication: Date;
}
