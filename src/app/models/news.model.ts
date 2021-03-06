import {UserModel} from './user.model';
import {ImageModel} from './image.model';

export class NewsModel {
  id: any;
  titre: String;
  contenu: String;
  datePublication: Date;
  auteur: UserModel;
  likes: UserModel[] = [];
  public: boolean;
  noSms: boolean;
  // imageJointe: String;
  // imageJointeType: String;
  avatar;
  rawFile:any;
  images: ImageModel[] = [];
  imageIds: String = "";
  videoLink: String;
}
