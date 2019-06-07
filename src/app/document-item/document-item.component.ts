import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';

@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['./document-item.component.css']
})
export class DocumentItemComponent implements OnInit {

  documents: any[];
  documentSubscription: Subscription;
  @Input() document: DocumentModel;
  @Output() documentSelected = new EventEmitter<DocumentModel>();
  @Output() documentDeleted = new EventEmitter<DocumentModel>();
  @Output() documentDownloaded = new EventEmitter<DocumentModel>();

  constructor(private documentService: DocumentService) { }

  ngOnInit() {
    this.documentSubscription = this.documentService.documentSubject.subscribe(
      (documents: any[]) => {
        this.documents = documents;
      }
    );
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
}
