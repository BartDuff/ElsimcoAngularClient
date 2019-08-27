import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';
import { saveAs } from 'file-saver';
import {environment} from '../../environments/environment';
import { InputFileComponent } from 'ngx-input-file';
import {UserModel} from '../models/user.model';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {MatDialogConfig} from '@angular/material';
import {ToastrService} from 'ngx-toastr';

const API_URL = environment.apiUrl;
@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})

export class DocumentListComponent implements OnInit {
  currentUser: UserModel;
  documents: DocumentModel[];
  selectedDocument: DocumentModel;
  selectedFiles;
  filename;
  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;


  constructor(private documentService: DocumentService,
              private dialog: MatDialog,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.getDocuments();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // const headers = [{name: 'Accept', value: 'application/json'}];
    // this.uploader = new FileUploader({url: API_URL + '/documents/upload', autoUpload: true, headers: headers});
    // this.uploader.onCompleteAll = () => alert('File uploaded');
  }
  getDocuments() {
    this.documentService.getDocuments().subscribe(r=>this.documents=r);
  }

  deleteDocument(documentToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data)=>{
        if(data) {
          this.documentService.deleteDocument(documentToDelete).subscribe(
            ()=> {
              this.documents.splice(this.documents.indexOf(documentToDelete), 1);
            }
          );
        }
      }
    )
  }

  selectDocument(documentSelected: DocumentModel) {
    this.selectedDocument = documentSelected;
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

  getDocument(documentToDownload: DocumentModel) {
    this.documentService.getDocument(documentToDownload.id).subscribe(
      (res) => {
        let d : DocumentModel = res ;
        if (d.fileBase64) {
          var blob = this.base64ToBlob(d.fileBase64, 'text/plain');
          saveAs(blob, d.originalFileName);
        }
      });
  }

  sendDocumentByEmail(documentToSend: DocumentModel) {
    this.documentService.sendDocumentByEmail(this.currentUser,documentToSend).subscribe(
      (res) => this.toastrService.success(documentToSend.originalFileName + " envoyé avec succès!", "Envoyé"),
      (err)=> this.toastrService.error(documentToSend.originalFileName + ": echec de l'envoi!","Erreur d'envoi")
    );
  }

  handleFile(){
    console.log("handleFile");
    for(let i=0; i < this.inputFileComponent.files.length;i++) {
      var file = this.inputFileComponent.files[i];
      console.log (file.file.name,i);
      this.filename=file.file.name;
      if (file) {
        var reader = new FileReader();

        if (reader.readAsBinaryString === undefined) {
          reader.onload = this._handleReaderLoadedIE.bind(this);
          reader.readAsArrayBuffer(file.file);
        } else {
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file.file);
        }
        this.selectedFiles.splice(i,1)
        i--
      }
    }
  }

  _handleReaderLoadedIE(readerEvt) {
    console.log("_handleReaderLoadedIE");

    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = "";
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++)
      binary += String.fromCharCode(bytes[i]);
    this.documentService.uploadDocument(btoa(binary), this.filename);
  }
  _handleReaderLoaded(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
console.log(readerEvt)
    console.log("_handleReaderLoaded");
    console.log(this.s(this.selectedFiles));
    this.documentService.uploadDocument(btoa(readerEvt.target.result), this.filename).subscribe(
      ()=>{this.getDocuments();
                this.getDocuments()
                }
      )
  }

  s(s){
    JSON.stringify(s)
  }

}
