import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {withIdentifier} from 'codelyzer/util/astQuery';
import {from} from 'rxjs';
import {ImageService} from '../services/image.service';
import * as EXIF from 'exif-js';


@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService,
              private imageService: ImageService) { }

  addForm: FormGroup;
  user: UserModel;
  fileEncoded;
  fileCompEncoded;
  alreadyUploaded = [];
  alreadyUploadedCompetence = [];
  fileValid = true;
  filename;
  dossierFilename;

  get f() {
    return this.addForm.value;
  }

  ngOnInit() {
    this.user = new UserModel();
    this.addForm = this.formBuilder.group({
      email: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      role: ['', Validators.required],
      fonction:['', Validators.required],
      statut:['', Validators.required],
      dateNaissance:['', Validators.required],
      trigramme:[''],
      cpNMoins1:[''],
      cpN:[''],
      rttn:[''],
      congeAnciennete:[''],
      adressePostale:[''],
      codePostal:[''],
      ville:[''],
      telephone:['', Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')],
      telPro:['', Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')],
      emailPerso:['', Validators.email],
      dateArrivee:['', Validators.required],
      metier:['']
    });

  }

  onSubmit() {
    this.user.email = this.f.email;
    this.user.prenom = this.f.prenom;
    this.user.nom = this.f.nom;
    this.user.trigramme = this.f.trigramme;
    this.user.cpNMoins1 = +this.f.cpNMoins1.toString().replace(",",".");
    this.user.cpN = +this.f.cpN.toString().replace(",",".");
    this.user.rttn = +this.f.rttn.toString().replace(",",".");
    this.user.congeAnciennete = +this.f.congeAnciennete.toString().replace(",",".");
    this.user.adressePostale = this.f.adressePostale;
    this.user.codePostal = this.f.codePostal;
    this.user.ville = this.f.ville;
    this.user.telephone = this.f.telephone;
    this.user.telPro = this.f.telPro;
    this.user.emailPerso = this.f.emailPerso;
    this.user.dateArrivee = this.f.dateArrivee;
    this.user.dateNaissance = this.f.dateNaissance;
    this.user.metier = this.f.metier;
    this.user.role = this.addForm.get('role').value;
    this.user.fonction = this.addForm.get('fonction').value;
    this.user.statut = this.addForm.get('statut').value;
    this.userService.addUser(this.user)
      .subscribe( data => {
        this.router.navigate(['users']);
      });
  }

  handleFile(user) {
    let file = user.rawFile[0];
    if (file) {
      this.filename=file.file.name;
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this, file);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this, file);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      }

      // this.selectedFiles.splice(i,1);
      // i--
    }
  }

  handleFileCompetence(user) {
    let file = user.competenceFile[0];
    if (file) {
      this.dossierFilename = file.file.name;
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedCompetenceIE.bind(this, file);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoadedCompetence.bind(this, file);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      }

      // this.selectedFiles.splice(i,1);
      // i--
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
      this.fileValid = false;
      file.preview = r.toString();
      this.postImage(file);
    });
  }

  _handleReaderLoaded(file, readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileEncoded = btoa(readerEvt.target.result);
    this.setImgOrientation(file.file, this.fileEncoded).then(r=> {
      this.fileValid = false;
      file.preview = r.toString();
      this.postImage(file);
    });
  }

  _handleReaderLoadedCompetenceIE(file, readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    this.fileCompEncoded = btoa(binary);
    this.postDossier(file);
  }

  _handleReaderLoadedCompetence(file, readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileCompEncoded = btoa(readerEvt.target.result);
    this.postDossier(file);
  }

  removeImage(file){
    let base64ToDelete = "";
    if(file.preview.changingThisBreaksApplicationSecurity){
      base64ToDelete = file.preview.changingThisBreaksApplicationSecurity.substr(("data:"+file.file.type+";base64,").length-1);
    } else {
      base64ToDelete = file.preview.substr(("data:"+file.file.type+";base64,").length);
    }
    this.user.imageId = 0;
    this.alreadyUploaded.splice(this.alreadyUploaded.indexOf(base64ToDelete),1);
  }

  removeDossier(file){
    this.user.competenceId = 0;
    this.alreadyUploadedCompetence.splice(this.alreadyUploadedCompetence.indexOf(file.id),1);
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
        this.fileValid = false;
        this.user.imageId = data.id;
        newimg.id = data.id;
      }
    )
  }

  postDossier(file){
    if(this.alreadyUploadedCompetence.indexOf(file.id) !=-1){
      this.fileValid = true;
      return;
    }
    this.alreadyUploadedCompetence.push(file.id);
    this.imageService.uploadJustif({imageJointe: this.fileCompEncoded, imageJointeType: this.dossierFilename.split('.')[this.dossierFilename.split('.').length - 1].toLowerCase(), id: null, originalFilename: this.dossierFilename }).subscribe(
      (data)=>{
        this.fileValid = false;
        this.user.competenceId = data.id;
        file.id = data.id;
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
