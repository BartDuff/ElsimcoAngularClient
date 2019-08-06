import {UserModel} from './user.model';
import {Moment} from 'moment';

export class FicheModel {
  id: any;
  uri:String;
  mois: String;
  annee:number;
  rtte: number;
  rtts: number;
  conges: number;
  absences: number;
  datePublication: Date;
  congesSansSolde: number;
  maladie:number;
  formation: number;
  intercontrat:number;
  user: UserModel;
  joursOuvres:number;
  joursTravailles:number;
  commentaires:any = {};
  tableImg:any;
}