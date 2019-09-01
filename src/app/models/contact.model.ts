import {Diplome} from './diplome.model';
import {Reference} from './reference.model';

export class ContactModel {
  id: any;
  secretid: String;
  nom: String;
  prenom: String;
  email: String;
  mobile: number;
  posteRecherche: String;
  fileBase64: String;
  accepte: boolean;
}
