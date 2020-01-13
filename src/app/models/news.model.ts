import {UserModel} from './user.model';

export class NewsModel {
  id: any;
  titre: String;
  contenu: String;
  datePublication: Date;
  auteur: UserModel;
  likes: UserModel[];
  isPublic: boolean;
  imageJointe: String;
  imageJointeType: String;
  rawFile:any;
}
