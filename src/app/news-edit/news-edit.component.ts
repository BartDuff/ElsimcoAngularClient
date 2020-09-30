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
import {ImageService} from '../services/image.service';

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
              private sanitizer: DomSanitizer,
              private imageService: ImageService) { }

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  editForm: FormGroup;
  currentUser: UserModel;
  newsitem: NewsModel;
  selectedFiles;
  alreadyUploaded =[];
  fileEncoded;
  fileValid = true;
  filename;
  loading = false;
  itemImg;
  typeMatch ={
    'jpeg':'jpg',
    'JPG':'jpg',
    'JPEG':'jpg',
    'jpg':'jpg',
    'png':'png',
    'PNG':'png'
  };

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
      video:[''],
      isPublic: ['', Validators.required],
      isAvatar:[''],
      isNoSms:['']
    });
    this.route.params.subscribe(
      params => this.newsService.getSingleNews(params['id']).subscribe(
        data => {
          this.newsitem = data;
          this.selectedFiles = [];
          // if(data.images.length>0){
          //   for(let img of data.images){
          //     this.selectedFiles.push({'file' : new File([this.base64ToBlob(img.imageJointe)],""+img.originalFilename, { type: 'image/'+img.imageJointeType })});
          //   }
          // }
          if(data.imageIds) {
            for (let ids of data.imageIds.split(",")) {
              console.log(ids);
              this.imageService.getImage(+ids).subscribe(
                (image) => {
                  this.selectedFiles.push({'file': new File([this.base64ToBlob(image.imageJointe)], image.originalFilename.toString(), {type: 'image/' + image.imageJointeType}),'preview':this.sanitizer.bypassSecurityTrustResourceUrl('data:image'+image.imageJointeType+";base64,"+image.imageJointe), 'id':image.id})
                  this.alreadyUploaded.push(image.imageJointe);
                }
              );
            }
          }
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.contenu.setValue(data.contenu);
          this.editForm.controls.video.setValue(data.videoLink);
          this.editForm.controls.titre.setValue(data.titre);
          this.editForm.controls.isPublic.setValue(data.public);
          this.editForm.controls.isAvatar.setValue(data.avatar);
          this.editForm.controls.isNoSms.setValue(data.noSms);
          console.log(this.selectedFiles);
        }
      )
    );
  }

  onSubmit() {
    this.loading = true;
    this.newsitem.auteur = this.currentUser;
    // this.newsitem.images = [];
    // for(let file of this.selectedFiles){
    //   let image = new ImageModel();
    //   image.imageJointeType = this.typeMatch[file.file.name.split('.')[file.file.name.split('.').length - 1]];
    //   image.imageJointe = file.preview.substr(("data:image/" + image.imageJointeType.toLowerCase() + ";base64,").length);
    //   image.originalFilename = file.file.name;
    //   this.newsitem.images.push(image);
    // }
    this.newsService.editNews(this.newsitem)
      .subscribe( data => {
        this.loading = false;
        this.router.navigate(['news']);
      });
  }

  removeImage(newsitem){
    let base64ToDelete = "";
    if(newsitem.preview.changingThisBreaksApplicationSecurity){
      base64ToDelete = newsitem.preview.changingThisBreaksApplicationSecurity.substr(("data:"+newsitem.file.type+";base64,").length-1);
    } else {
      base64ToDelete = newsitem.preview.substr(("data:"+newsitem.file.type+";base64,").length);
    }
    let idArray = this.newsitem.imageIds.split(",");
    idArray.splice(idArray.indexOf(newsitem.id.toString()),1);
    this.newsitem.imageIds = idArray.join(",");
    this.alreadyUploaded.splice(this.alreadyUploaded.indexOf(base64ToDelete),1);
  }

  handleFile(newsitem:NewsModel) {
    let image = null;
    for (let i = 0; i < this.inputFileComponent.files.length; i++) {
      this.fileValid = false;
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
          reader.onload = this._handleReaderLoadedIE.bind(this, this.inputFileComponent.files[i]);
          reader.readAsArrayBuffer(file.file);
          reader.onloadend = () => {
            // this.setImgOrientation(file.file, this.fileEncoded).then(r=> this.inputFileComponent.files[i].preview = r.toString());
          };
          // reader.onloadend = () => {
          //   image.imageJointe = this.fileEncoded;
          //   this.fileEncoded = null;
          //   image.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          //   image.originalFilename = this.filename;
          //   this.fileValid = true;
          // };
        } else {
          reader.onload = this._handleReaderLoaded.bind(this, this.inputFileComponent.files[i]);
          reader.readAsBinaryString(file.file);
          reader.onloadend = () => {
            // this.setImgOrientation(file.file, this.fileEncoded).then(r=> this.inputFileComponent.files[i].preview = r.toString());
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

  _handleReaderLoadedIE(file, readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileEncoded = btoa(binary);
    this.setImgOrientation(file.file, this.fileEncoded).then(r=> {
      file.preview = r.toString();
      this.postImage(file);
    });
  }

  _handleReaderLoaded(file, readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileEncoded = btoa(readerEvt.target.result);
    this.setImgOrientation(file.file, this.fileEncoded).then(r=> {
      file.preview = r.toString();
      this.postImage(file);
    });
  }

  postImage(newimg){
    let encodedImg = newimg.preview.substr(("data:"+newimg.file.type+";base64,").length);
    if(this.alreadyUploaded.indexOf(encodedImg) !=-1){
      this.fileValid = true;
      return;
    }
    this.alreadyUploaded.push(encodedImg);
    this.imageService.uploadImage({imageJointe: encodedImg, imageJointeType: newimg.file.name.split('.')[newimg.file.name.split('.').length - 1].toLowerCase(), id: null, originalFilename: newimg.file.name }).subscribe(
      (data)=>{
        this.fileValid = true;
        if(this.newsitem.imageIds.length>0){
          this.newsitem.imageIds += ",";
        }
        newimg.id = data.id;
        this.newsitem.imageIds += data.id;
      }
    )
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
    return new Promise((resolve, reject) => {
      const that = this;
      EXIF.getData(file, function () {
        if (this && this.exifdata && this.exifdata.Orientation) {
          that.resetOrientation(file, inputBase64String, this.exifdata.Orientation,
            (resetBase64Image) => {
              inputBase64String = resetBase64Image;
              resolve(inputBase64String);
            });
        } else {
          resolve("data:"+file.type.toLowerCase()+";base64,"+inputBase64String);
        }
      });
    });
  }

  resetOrientation(file, srcBase64, srcOrientation, callback) {
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
      callback(canvas.toDataURL().replace('image/png',file.type.toLowerCase()));
    };

    img.src = "data:"+ file.type.toLowerCase() +  ";base64, " + srcBase64;
  }

}
