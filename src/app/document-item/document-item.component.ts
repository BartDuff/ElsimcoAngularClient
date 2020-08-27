import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'tr[app-document-item]',
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.css']
})
export class DocumentItemComponent implements OnInit {
  currentUser: UserModel;
  documents: any[];
  newTitle : String;
  documentSubscription: Subscription;
  modifying: boolean = false;
  @Input() document: DocumentModel;
  @Output() documentSelected = new EventEmitter<DocumentModel>();
  @Output() documentDeleted = new EventEmitter<DocumentModel>();
  @Output() documentDownloaded = new EventEmitter<DocumentModel>();
  @Output() documentOpened = new EventEmitter<DocumentModel>();
  @Output() documentToSend = new EventEmitter<DocumentModel>();
  @Output() documentToModify = new EventEmitter<DocumentModel>();

  constructor(private documentService: DocumentService) { }

  ngOnInit() {
    this.documentSubscription = this.documentService.documentSubject.subscribe(
      (documents: any[]) => {
        this.documents = documents;
      }
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.newTitle = this.document.originalFileName.split(".")[0];
    this.documentService.emitDocumentSubject();
  }

  selectDocument() {
    this.documentSelected.emit(this.document);
  }

  deleteDocument() {
    this.documentDeleted.emit(this.document);
  }

  downloadDocument() {
    this.documentDownloaded.emit(this.document);
  }

  openDocument() {
    this.documentOpened.emit(this.document);
  }

  sendDocumentByEmail() {
    this.documentToSend.emit(this.document);
  }

  modifyTitle() {
    this.document.originalFileName = this.newTitle + "." + this.document.originalFileName.split(".")[1];
    this.documentToModify.emit(this.document);
  }
}
