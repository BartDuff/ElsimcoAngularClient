import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ContactService} from '../services/contact.service';
import {ContactModel} from '../models/contact.model';

@Component({
  selector: 'tr[app-contact-item]',
  templateUrl: './contact-item.component.html',
  styleUrls: ['./contact-item.component.css']
})
export class ContactItemComponent implements OnInit {

  @Input() contact;
  @Output() contactAccepted = new EventEmitter<ContactModel>();
  @Output() contactDeleted = new EventEmitter<ContactModel>();
  @Output() contactCV = new EventEmitter<ContactModel>();

  constructor(private contactService: ContactService) { }

  ngOnInit() {
    this.contactService.emitContactSubject();
  }

  deleteContact() {
    this.contactDeleted.emit(this.contact);
  }

  acceptContact() {
    this.contactAccepted.emit(this.contact);
  }

  downloadCV() {
    this.contactCV.emit(this.contact);

  }
}
