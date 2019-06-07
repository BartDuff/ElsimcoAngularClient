import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';
import { saveAs } from 'file-saver';

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

  downloadDocument(documentToDownload: DocumentModel) {
    this.documentService.downloadDocument().subscribe(
      (res) => {
        saveAs(new Blob([res], { type: 'application/octet-stream' }), 'FP_2017_Elsimco.xlsx');
      });
  }
}
