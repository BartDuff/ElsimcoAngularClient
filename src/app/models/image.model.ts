import {NewsModel} from './news.model';

export class ImageModel {
  id: any;
  imageJointe: String;
  imageJointeType: String;
  originalFilename: String;
  newsAssoc: NewsModel;
  rawFile:any;
}
