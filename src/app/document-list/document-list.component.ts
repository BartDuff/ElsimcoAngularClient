import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {

  documents: Observable<DocumentModel[]>;
  selectedDocument: DocumentModel;

  constructor(private documentService: DocumentService) {
  }

  ngOnInit() {
    this.getDocuments();
  }

  getDocuments() {
    this.documents = this.documentService.getDocuments();
  }

  selectDocument(documentSelected: DocumentModel) {
    this.selectedDocument = documentSelected;
  }

  deleteDocument(documentToDelete: DocumentModel) {
    this.documentService.deleteDocument(documentToDelete).subscribe(
      () => this.getDocuments()
    );
  }
}
