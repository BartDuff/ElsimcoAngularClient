import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';
import {NewsService} from '../services/news.service';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-news-edit',
  templateUrl: './news-edit.component.html',
  styleUrls: ['./news-edit.component.css']
})
export class NewsEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private newsService: NewsService,
              private sanitizer: DomSanitizer) { }

  editForm: FormGroup;
  currentUser: UserModel;
  newsitem: NewsModel;
  fileEncoded;
  fileValid = true;
  filename;
  itemImg;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
    });
    this.route.params.subscribe(
      params => this.newsService.getSingleNews(params['id']).subscribe(
        data => {
          this.newsitem = data;
          this.newsitem.rawFile = [];
          if(data.imageJointe != null){
            this.newsitem.rawFile.push({'file' : new File([this.base64ToBlob(data.imageJointe)],'exemple.'+data.imageJointeType, { type: 'image/'+data.imageJointeType })});
          }
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.contenu.setValue(data.contenu);
          this.editForm.controls.titre.setValue(data.titre);
        }
      )
    );
  }

  onSubmit() {
    this.newsitem.auteur = this.currentUser;
    this.newsService.editNews(this.newsitem)
      .subscribe( data => {
        this.router.navigate(['news']);
      });
  }

  handleFile(newsitem:NewsModel) {
    let file = this.newsitem.rawFile[0];
    if (file) {
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          newsitem.imageJointe = this.fileEncoded;
          this.fileEncoded = null;
          newsitem.imageJointeType = this.filename.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
          this.itemImg = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + newsitem.imageJointeType.toLowerCase() + ';base64, '+ newsitem.imageJointe);
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          newsitem.imageJointe = this.fileEncoded;
          this.fileEncoded = null;
          newsitem.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
          this.itemImg = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + newsitem.imageJointeType.toLowerCase() + ';base64, '+ newsitem.imageJointe);
        };
      }

      // this.selectedFiles.splice(i,1);
      // i--
    }
  }

  _handleReaderLoadedIE(readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileEncoded = btoa(binary);
  }

  _handleReaderLoaded(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileEncoded = btoa(readerEvt.target.result);
  }

  public base64ToBlob(b64Data, contentType = '', sliceSize = 512) {
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
