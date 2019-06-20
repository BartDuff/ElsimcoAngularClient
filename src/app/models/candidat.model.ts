import {ContactModel} from './contact.model';

export class CandidatModel extends ContactModel {

  constructor() {
    super();
  }

  private numeroSecu:String;
  private diplome:String;
  private domaine:String;
  private experience:number;
  private salaireActuelBrut:number;
  private competences:String;
  private situationActuelle:String;
  private disponibilite:Date;
  private mobilite:boolean;
  private echangesEffectues:String;
}
