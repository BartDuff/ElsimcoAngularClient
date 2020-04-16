import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';
import { saveAs } from 'file-saver';
import {environment} from '../../environments/environment';
import { InputFileComponent } from 'ngx-input-file';
import {UserModel} from '../models/user.model';
import {MatDialog, MatPaginator, PageEvent} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {MatDialogConfig} from '@angular/material';
import {ToastrService} from 'ngx-toastr';
import {HttpHeaderResponse} from '@angular/common/http';
import {createTextNode} from '@angular/core/src/render3/node_manipulation';

const API_URL = environment.apiUrl;
@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})

export class DocumentListComponent implements OnInit, AfterViewInit {
  currentUser: UserModel;
  documents: DocumentModel[];
  pagedDocuments: DocumentModel[];
  selectedDocument: DocumentModel;
  selectedFiles;
  filename;
  sending = false;
  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;

  length: number = 0;
  pageSize: number = 10;
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;

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

  ngAfterViewInit(){
    this.paginatorTop._intl.itemsPerPageLabel = 'Documents par page : ';
    this.paginatorTop._intl.nextPageLabel = 'Page suivante';
    this.paginatorTop._intl.previousPageLabel = 'Page précédente';
    this.paginatorTop._intl.firstPageLabel = 'Première page';
    this.paginatorTop._intl.lastPageLabel = 'Dernière page';
    this.paginatorTop._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottom = this.paginatorTop;
  }

  getRangeLabel = (page: number, pageSize: number, length: number) =>  {
    if (length === 0 || pageSize === 0) {
      return `0 / ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} sur ${length}`;
  };

  getDocuments() {
    this.documentService.getDocuments().subscribe(r=> {
      this.documents=r;
        this.length = this.documents.length;
      },
      ()=>{},
      ()=>{
        this.pagedDocuments = this.documents.slice(0,this.pageSize);
      });
  }

  OnPageChange(event: PageEvent, paginator){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if(endIndex > this.length){
      endIndex = this.length;
    }
    this.pagedDocuments = this.documents.slice(startIndex, endIndex);
    paginator.pageIndex = event.pageIndex;
  }

  deleteDocument(documentToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.documentService.deleteDocument(documentToDelete).subscribe(
            () => {
              this.documents.splice(this.documents.indexOf(documentToDelete), 1);
            }
          );
        }
      }
    );
  }

  selectDocument(documentSelected: DocumentModel) {
    this.selectedDocument = documentSelected;
  }

  public base64ToBlob(b64Data, contentType= '', sliceSize= 512) {
    b64Data = b64Data.replace(/\s/g, ''); // IE compatibility...
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
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    this.documentService.getDocument(documentToDownload.id).subscribe(
      (res) => {
        let d : DocumentModel = res ;
        if (d.fileBase64) {
          let blob = this.base64ToBlob(d.fileBase64, 'application/'+ d.originalFileName.split('.')[d.originalFileName.split('.').length-1]);
          if(!navigator.userAgent.match('CriOS') || !isSafari) {
            saveAs(blob, d.originalFileName);
          } else {
            // let reader = new FileReader();
            // reader.onload = function(e){
            //   window.location.href = reader.result
            // };
            // reader.readAsDataURL(blob);
            let fileURL = window.URL.createObjectURL(blob,);
            let tab = window.open();
            tab.location.href = fileURL;
          }
        }
      });
  }

  openDocument(documentToOpen: DocumentModel) {
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    this.documentService.openDocument(documentToOpen.id).subscribe(
      (res) => {
        let d: DocumentModel = res;
        if (d.fileBase64) {
          // let blob = this.base64ToBlob(d.fileBase64, 'application/' + d.originalFileName.split('.'[2]));
          // let reader = new FileReader();
          // reader.onload = function (e) {
          //   window.location.href = reader.result
          // };
          // reader.readAsDataURL(blob);
          // window.open("data:application/" + d.originalFileName.split('.')[2]+ ";base64, "+d.fileBase64, '_blank');
          let blob = this.base64ToBlob(d.fileBase64, 'application/' + d.originalFileName.split('.')[d.originalFileName.split('.').length-1]);
          if(navigator.userAgent.match('CriOS') || isSafari) {
            saveAs(blob, d.originalFileName);
          } else {
            let fileURL = window.URL.createObjectURL(blob);
            let tab = window.open();
            // if(d.originalFileName.split('.')[d.originalFileName.split('.').length-1] == 'pdf'){
            tab.location.href = fileURL;
            // } else {
            //   // tab.onload = function(){this.document.body.innerHTML+= `<iframe src= "https://view.officeapps.live.com/op/embed.aspx?src=${fileURL}" width="100%" height="800"> </iframe>`};
            //   let newblob = new Blob([blob], {type:"text/plain;charset=utf-8"});
            //   let newFileURL = URL.createObjectURL(newblob);
            //   tab.location.href = newFileURL;
            // }
          }
        }
      });
      }

  sendDocumentByEmail(documentToSend: DocumentModel) {
    this.sending = true;
    this.documentService.sendDocumentByEmail(this.currentUser,documentToSend).subscribe(
      (res) => {
        this.sending = false;
        this.toastrService.success(documentToSend.originalFileName + " envoyé avec succès !", "Envoyé");
      },
      (err)=> {
        this.sending = false;
        this.toastrService.error(documentToSend.originalFileName + ": echec de l'envoi !", "Erreur d'envoi");
      }
    );
  }

  handleFile(){
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
        this.selectedFiles.splice(i,1);
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
    this.documentService.uploadDocument(btoa(binary), this.filename).subscribe(
      ()=>{
        this.getDocuments();
      }
    );
  }
  _handleReaderLoaded(readerEvt) {
    console.log(this.s(this.selectedFiles));
    this.documentService.uploadDocument(btoa(readerEvt.target.result), this.filename).subscribe(
      ()=>{this.getDocuments();}
      )
  }

  s(s){
    JSON.stringify(s)
  }

}
