import { Component, OnInit } from '@angular/core';
import {ContactModel} from '../models/contact.model';
import {Subscription} from 'rxjs';
import {ContactService} from '../services/contact.service';
import {ToastrService} from 'ngx-toastr';
import { saveAs } from 'file-saver';
import {CandidatModel} from '../models/candidat.model';
import {CandidatService} from '../services/candidat.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
  contacts: ContactModel[];
  constructor(private contactService: ContactService,
              private candidatService: CandidatService,
              private toastrService:ToastrService) { }

  ngOnInit() {
    this.getContacts()
  }

  getContacts() {
    this.contactService.getContacts().subscribe(
      (data) => this.contacts = data.content
    );
  }

  AcceptContact(contactAccepted: ContactModel) {
    this.contactService.deleteContact(contactAccepted).subscribe(
      () => {
        this.contacts.splice(this.contacts.indexOf(contactAccepted), 1);
        this.candidatService.addCandidat((<CandidatModel>contactAccepted)).subscribe(
          () => {
            this.toastrService.success('Candidat ajouté à la Candidathèque', 'Candidature acceptée');
          }
        );
      })

  }

  RefuseContact(contactToDelete: ContactModel) {
    this.contactService.deleteContact(contactToDelete).subscribe(
      () => {
        this.contacts.splice(this.contacts.indexOf(contactToDelete), 1);
        this.toastrService.error('Candidature supprimée', 'Suppression effectuée');
        this.contactService.sendRejectionMail(contactToDelete.email, contactToDelete).subscribe(
          ()=> console.log("succès")
        );
      }
    )
  }

  downloadCV(contactCV: ContactModel) {
    this.contactService.getContact(contactCV.id).subscribe(
      (res) => {
        let c : ContactModel = res ;
        console.log(c);
        if (c.fileBase64) {
          let blob = this.base64ToBlob(c.fileBase64);
          saveAs(blob, `${contactCV.prenom} ${contactCV.nom}_CV.pdf`);
        }
      });
  }

  public base64ToBlob(b64Data, contentType='', sliceSize=512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
  }
}
