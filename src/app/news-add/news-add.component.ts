import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-news-add',
  templateUrl: './news-add.component.html',
  styleUrls: ['./news-add.component.css']
})
export class NewsAddComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private newsService: NewsService,
              private sanitizer: DomSanitizer) { }

  addForm: FormGroup;
  currentUser: UserModel;
  newsitem: NewsModel;
  fileEncoded;
  fileValid = true;
  filename;
  itemImg;

  get f() {
    return this.addForm.value;
  }

  ngOnInit() {
    this.newsitem = new NewsModel();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.addForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
      isPublic: ['', Validators.required]
    });

  }

  onSubmit() {
    let newsitem:NewsModel = this.f;
    newsitem.auteur = this.currentUser;
    newsitem.imageJointe = this.newsitem.imageJointe;
    newsitem.imageJointeType = this.newsitem.imageJointeType;
    this.newsService.addNews(newsitem)
      .subscribe( () => {
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
}
