import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';
import { saveAs } from 'file-saver';
import {FileUploader} from 'ng2-file-upload';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;
@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})

export class DocumentListComponent implements OnInit {

  documents: Observable<DocumentModel[]>;
  selectedDocument: DocumentModel;
  @ViewChild('fileInput') fileInput: ElementRef;

  uploader: FileUploader;
  isDropOver: boolean;

  constructor(private documentService: DocumentService) {
  }

  ngOnInit() {
    this.getDocuments();
    const headers = [{name: 'Accept', value: 'application/json'}];
    this.uploader = new FileUploader({url: API_URL + '/documents/upload', autoUpload: true, headers: headers});
    this.uploader.onCompleteAll = () => alert('File uploaded');
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
        saveAs(new Blob([res], { type: 'application/octet-stream' }), documentToDownload.nom);
      });
  }

  fileOverAnother(e: any): void {
    this.isDropOver = e;
  }

  fileClicked() {
    this.fileInput.nativeElement.click();
  }

}
