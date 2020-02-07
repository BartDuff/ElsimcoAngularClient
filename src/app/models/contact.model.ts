import {Diplome} from './diplome.model';
import {Reference} from './reference.model';

export class ContactModel {
  id: any;
  secretid: String;
  nom: String;
  prenom: String;
  civilite: String;
  email: String;
  mobile: number;
  posteRecherche: String;
  dateCandidature: Date;
  fileBase64: String;
  fileType: String;
  fileName: String;
  accepte: boolean;
}
