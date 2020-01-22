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
    let newsitem:NewsModel = this.f;
    newsitem.images = [];
    newsitem.auteur = this.currentUser;
    // newsitem.imageJointe = this.newsitem.imageJointe;
    // newsitem.imageJointeType = this.newsitem.imageJointeType;
    for(let file of this.selectedFiles){
      let image = new ImageModel();
        image.imageJointeType = file.file.name.split('.')[file.file.name.split('.').length - 1];
        image.imageJointe = file.preview.substr(("data:image/" + image.imageJointeType.toLowerCase() + ";base64, ").length);
        image.originalFilename = file.file.name;
        // image.newsAssoc = newsitem;
        newsitem.images.push(image);
    }
    this.newsService.addNews(newsitem)
      .subscribe( (data) => {
        this.loading = false;
        this.router.navigate(['news']);
      },
        (error)=>console.log(error));
  }
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


  // resizeFiles(file: File) {
  //   let dataurl = null;
  //   // Create an image
  //   let img = document.createElement("img");
  //   // Create a file reader
  //   let reader = new FileReader();
  //   // Set the image once loaded into file reader
  //   reader.onload = function (e) {
  //     img.src = e.target.result;
  //
  //     img.onload = function () {
  //       let canvas = document.createElement("canvas");
  //       let ctx = canvas.getContext("2d");
  //       ctx.drawImage(img, 0, 0);
  //
  //       var MAX_WIDTH = 800;
  //       var MAX_HEIGHT = 600;
  //       var width = img.width;
  //       var height = img.height;
  //
  //       if (width > height) {
  //         if (width > MAX_WIDTH) {
  //           height *= MAX_WIDTH / width;
  //           width = MAX_WIDTH;
  //         }
  //       } else {
  //         if (height > MAX_HEIGHT) {
  //           width *= MAX_HEIGHT / height;
  //           height = MAX_HEIGHT;
  //         }
  //       }
  //       canvas.width = width;
  //       canvas.height = height;
  //       let context = canvas.getContext("2d");
  //       context.drawImage(img, 0, 0, width, height);
  //
  //       dataurl = canvas.toDataURL("image/"+file.type);
  //
  //       //   // Post the data
  //       //   let fd = new FormData();
  //       //   fd.append("name", "some_filename.jpg");
  //       //   fd.append("image", dataurl);
  //       //   fd.append("info", "lah_de_dah");
  //       //   $.ajax({
  //       //     url: '/ajax_photo',
  //       //     data: fd,
  //       //     cache: false,
  //       //     contentType: false,
  //       //     processData: false,
  //       //     type: 'POST',
  //       //     success: function(data){
  //       //       $('#form_photo')[0].reset();
  //       //       location.reload();
  //       //     }
  //       //   });
  //       // } // img.onload
  //     };
  //     // Load files into file reader
  //     reader.readAsDataURL(file);
  //   }
  // }

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
}
