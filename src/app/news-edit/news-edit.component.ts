import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';
import {NewsService} from '../services/news.service';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageModel} from '../models/image.model';
import {InputFileComponent} from 'ngx-input-file';

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

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  editForm: FormGroup;
  currentUser: UserModel;
  newsitem: NewsModel;
  selectedFiles;
  fileEncoded;
  fileValid = true;
  filename;
  loading = false;
  itemImg;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
      isPublic: ['', Validators.required],
      isAvatar:['']
    });
    this.route.params.subscribe(
      params => this.newsService.getSingleNews(params['id']).subscribe(
        data => {
          this.newsitem = data;
          this.selectedFiles = [];
          if(data.images.length>0){
            for(let img of data.images){
              this.selectedFiles.push({'file' : new File([this.base64ToBlob(img.imageJointe)],""+img.originalFilename, { type: 'image/'+img.imageJointeType })});
            }
          }
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.contenu.setValue(data.contenu);
          this.editForm.controls.titre.setValue(data.titre);
          this.editForm.controls.isPublic.setValue(data.public);
          this.editForm.controls.isAvatar.setValue(data.avatar);
        }
      )
    );
  }

  onSubmit() {
    this.loading = true;
    this.newsitem.auteur = this.currentUser;
    this.newsitem.images = [];
    for(let file of this.selectedFiles){
      let image = new ImageModel();
      image.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
      image.imageJointe = file.preview.substr(("data:image/" + image.imageJointeType.toLowerCase() + ";base64,").length);
      image.originalFilename = file.file.name;
      this.newsitem.images.push(image);
    }
    this.newsService.editNews(this.newsitem)
      .subscribe( data => {
        this.loading = false;
        this.router.navigate(['news']);
      });
  }

  handleFile(newsitem:NewsModel) {
    let image = null;
    for (let i = 0; i < this.inputFileComponent.files.length; i++) {
      image = new ImageModel();
      let file = this.inputFileComponent.files[i];
      this.filename = file.file.name;
      if (file) {
        let reader = new FileReader();
        //   if (reader.readAsBinaryString === undefined) {
        //     reader.onload = this._handleReaderLoadedIE.bind(this);
        //     reader.readAsArrayBuffer(file.file);
        //   } else {
        //     reader.onload = this._handleReaderLoaded.bind(this);
        //     reader.readAsBinaryString(file.file);
        //   }
        // }
        if (reader.readAsBinaryString === undefined) {
          reader.onload = this._handleReaderLoadedIE.bind(this);
          reader.readAsArrayBuffer(file.file);
          // reader.onloadend = () => {
          //   image.imageJointe = this.fileEncoded;
          //   this.fileEncoded = null;
          //   image.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          //   image.originalFilename = this.filename;
          //   this.fileValid = true;
          // };
        } else {
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(file.file);
          // reader.onloadend = () => {
          //   image.imageJointe = this.fileEncoded;
          //   this.fileEncoded = null;
          //   image.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          //   image.originalFilename = this.filename;
          //   this.fileValid = true;
          // };
        }
      }
      // newsitem.images.push(image);
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
