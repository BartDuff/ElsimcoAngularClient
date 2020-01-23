import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {InputFileComponent} from 'ngx-input-file';
import {ImageModel} from '../models/image.model';
import * as EXIF from 'exif-js';

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

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  addForm: FormGroup;
  currentUser: UserModel;
  newsitem: NewsModel;
  fileEncoded;
  selectedFiles;
  fileValid = true;
  loading = false;
  filename;
  itemImg;
  typeMatch ={
    'jpeg':'jpg',
    'png':'png'
  };

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
      isPublic: ['', Validators.required],
      isAvatar:['']
    });

  }

  onSubmit() {
    this.loading = true;
    let newsitem: NewsModel = this.f;
    newsitem.images = [];
    newsitem.auteur = this.currentUser;
    // newsitem.imageJointe = this.newsitem.imageJointe;
    // newsitem.imageJointeType = this.newsitem.imageJointeType;
    for (let file of this.selectedFiles) {
      let image = new ImageModel();
      image.imageJointeType = this.typeMatch[file.file.name.split('.')[file.file.name.split('.').length - 1]];
      image.imageJointe = file.preview.substr(("data:image/" + image.imageJointeType.toLowerCase() + ";base64,").length);
      image.originalFilename = file.file.name;
      // image.newsAssoc = newsitem;
      newsitem.images.push(image);
    }
    newsitem.avatar = this.newsitem.avatar;
    newsitem.public = this.newsitem.public;
      this.newsService.addNews(newsitem)
        .subscribe( (data) => {
          this.loading = false;
          this.router.navigate(['news']);
        },
          (error)=>console.log(error))
    //
    // handleFile(newsitem:NewsModel) {
    //   let file = this.newsitem.rawFile[0];
    //   // this.resizeFiles(file.file);
    //   if (file) {
    //     this.fileValid = false;
    //     let reader = new FileReader();
    //     if (reader.readAsBinaryString === undefined) {
    //       reader.onload = this._handleReaderLoadedIE.bind(this);
    //       reader.readAsArrayBuffer(file.file);
    //       reader.onloadend = () => {
    //         newsitem.imageJointe = this.fileEncoded;
    //         this.fileEncoded = null;
    //         newsitem.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
    //         this.fileValid = true;
    //         this.itemImg = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + newsitem.imageJointeType.toLowerCase() + ';base64, '+ newsitem.imageJointe);
    //       };
    //     } else {
    //       reader.onload = this._handleReaderLoaded.bind(this);
    //       reader.readAsBinaryString(file.file);
    //       reader.onloadend = () => {
    //         newsitem.imageJointe = this.fileEncoded;
    //         this.fileEncoded = null;
    //         newsitem.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
    //         this.fileValid = true;
    //         this.itemImg = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + newsitem.imageJointeType.toLowerCase() + ';base64, '+ newsitem.imageJointe);
    //       };
    //     }
    //
    //     // this.selectedFiles.splice(i,1);
    //     // i--
    //   }
    // }
  }

  handleFile(newsitem) {
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
        }
      }
      // newsitem.images.push(image);
    }
  }


  _handleReaderLoadedIE(readerEvt) {
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileEncoded = btoa(binary);
  }

  _handleReaderLoaded(readerEvt) {
    this.fileEncoded = btoa(readerEvt.target.result);
  }

  s(s){
    JSON.stringify(s)
  }

  setImgOrientation(file, inputBase64String) {
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
          resolve("data:image/jpg;base64,"+inputBase64String);
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
      callback(canvas.toDataURL().replace("image/png", "image/jpg"));
    };

    img.src = "data:image/jpg;base64, " + srcBase64;
  }


}
