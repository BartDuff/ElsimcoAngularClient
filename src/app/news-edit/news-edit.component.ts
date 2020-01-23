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
import * as EXIF from 'exif-js';

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
    console.log(this.newsitem);
    // this.newsService.editNews(this.newsitem)
    //   .subscribe( data => {
    //     this.loading = false;
    //     this.router.navigate(['news']);
    //   });
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
          reader.onloadend = () => {
            this.setImgOrientation(file.file, this.fileEncoded).then(r=> this.inputFileComponent.files[i].preview = r.toString());
          };
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
          reader.onloadend = () => {
            this.setImgOrientation(file.file, this.fileEncoded).then(r=> this.inputFileComponent.files[i].preview = r.toString());
          };
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

  setImgOrientation(file, inputBase64String) {
    console.log(file);
    console.log(inputBase64String);
    return new Promise((resolve, reject) => {
      const that = this;
      EXIF.getData(file, function () {
        if (this && this.exifdata && this.exifdata.Orientation) {
          that.resetOrientation(inputBase64String, this.exifdata.Orientation,
            (resetBase64Image) => {
              inputBase64String = resetBase64Image;
              resolve(inputBase64String);
            });
        } else {
          resolve(inputBase64String);
        }
      });
    });
  }

  resetOrientation(srcBase64, srcOrientation, callback) {
    const img = new Image();

    img.onload = function () {
      const width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      callback(canvas.toDataURL());
    };

    img.src = "data:image/jpg;base64, " + srcBase64;
  }

}
