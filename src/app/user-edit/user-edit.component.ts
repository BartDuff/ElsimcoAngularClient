import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {EmailService} from '../services/email.service';
import {ToastrService} from 'ngx-toastr';
import {ImageService} from '../services/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DocumentModel} from '../models/document.model';
import {ImageModel} from '../models/image.model';
import { saveAs } from 'file-saver';
import {MissionModel} from '../models/mission.model';
import {NewsModel} from '../models/news.model';
import * as EXIF from 'exif-js';


@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private userService: UserService,
              private emailService: EmailService,
              private imageService: ImageService,
              private toastr: ToastrService,
              private dialog: MatDialog,
              private sanitizer: DomSanitizer) {
  }
  editForm: FormGroup;
  currentUser: UserModel;
  user: UserModel;
  testimg;
  base64downoad;
  formerUser: UserModel;
  fileEncoded;
  fileCompEncoded;
  alreadyUploaded = [];
  filename;
  dossierFilename;
  fileValid = true;
  recipient = "majoline.domingos@elsimco.com";
  // recipient = "florian.bartkowiak@gmail.com";
  keysDict = {
    id: 'Id',
    email: 'Email professionelle',
    prenom: 'Prénom',
    nom: 'Nom',
    role: 'Rôle',
    imageId: 'Image Id',
    competenceId: 'Dossier de compétences Id',
    fonction: 'Fonction',
    statut: 'Statut',
    trigramme: 'Trigramme',
    cpNMoins1: 'Compteur CP N-1',
    cpN: 'Compteur CP N',
    rttn: 'Conpteur RTT',
    congeAnciennete: 'Congés Ancienneté',
    adressePostale:'Adresse',
    codePostal:'Code postal',
    ville:'Ville',
    anticipation: 'Anticipation',
    telephone:'Téléphone',
    telPro: 'Téléphone Pro',
    emailPerso:'Email perso',
    dateArrivee:'Date d\'arrivée',
    dateDepart:'Date de départ',
    metier:'Métier',
    dateInscription:'Date d\'inscription',
    avatar: 'Avatar',
    missions: 'Missions',
    avatarType:'Type avatar',
    rawFile:'Fichier brut',
    competenceFile:'Fichier brut dossier de compétences',
    derniereConnexion:'Dernière connexion',
    likes: 'Likes'
  };

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      email: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      role: [''],
      fonction: [''],
      statut: [''],
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
      dateArrivee:[''],
      metier:['']
    });
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {
          this.user = data;
          this.user.dateArrivee = new Date(data.dateArrivee);
          this.user.derniereConnexion = new Date(data.derniereConnexion);
          this.user.rawFile = [];
          this.user.competenceFile = [];
          // if(data.avatar != null ) {
          //   this.user.rawFile.push({'file': new File([this.base64ToBlob(data.avatar)], 'exemple.' + data.avatarType, {type: 'image/' + data.avatarType})});
          // }
          if(data.imageId){
            this.imageService.getImage(data.imageId).subscribe(
              (image)=>{
                this.base64downoad = image;
                this.user.rawFile.push({'file': new File([this.base64ToBlob(image.imageJointe)], image.originalFilename.toString(), {type: 'image/' + image.imageJointeType}),'preview':this.sanitizer.bypassSecurityTrustResourceUrl('data:image'+image.imageJointeType+";base64,"+image.imageJointe), 'id':image.id});
                this.alreadyUploaded.push(image.imageJointe);
              }
            );
          }
          if(data.competenceId){
            this.imageService.getImage(data.competenceId).subscribe(
              (image)=>{
                this.base64downoad = image;
                this.user.competenceFile.push({'file': new File([this.base64ToBlob(image.imageJointe)], image.originalFilename.toString(), {type: 'image/' + image.imageJointeType})});
              }
            );
          }
          this.formerUser = {...this.user};
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.email.setValue(data.email);
          this.editForm.controls.prenom.setValue(data.prenom);
          this.editForm.controls.nom.setValue(data.nom);
          this.editForm.controls.trigramme.setValue(data.trigramme);
          this.editForm.controls.adressePostale.setValue(data.adressePostale);
          this.editForm.controls.codePostal.setValue(data.codePostal);
          this.editForm.controls.ville.setValue(data.ville);
          this.editForm.controls.telephone.setValue(data.telephone);
          this.editForm.controls.telPro.setValue(data.telPro);
          this.editForm.controls.emailPerso.setValue(data.emailPerso);
          // this.editForm.controls.dateArrivee.setValue(new Date(data.dateArrivee));
          this.editForm.controls.metier.setValue(data.metier);
          this.editForm.controls.role.setValue(data.role);
          this.editForm.controls.fonction.setValue(data.fonction);
          this.editForm.controls.statut.setValue(data.statut);
          this.editForm.controls.cpNMoins1.setValue(data.cpNMoins1);
          this.editForm.controls.cpN.setValue(data.cpN);
          this.editForm.controls.rttn.setValue(data.rttn);
          this.editForm.controls.congeAnciennete.setValue(data.congeAnciennete);
        }
      )
    );

  }

  getHello(){
    let date = new Date();
    let hour = date.getHours();
    if (hour >= 5 && hour <= 17) {
      return "Bonjour";
    } else {
      return "Bonsoir";
    }
  }

  onSubmit() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (d)=> {
        if (d) {
          if (this.editForm.get('role').value == '') {
            this.editForm.get('role').setValue(this.user.role);
          }
          if (this.editForm.get('fonction').value == '') {
            this.editForm.get('fonction').setValue(this.user.fonction);
          }
          let details = [];
          for(let k of Object.keys(this.user)){
            if(this.formerUser[k] != this.editForm.value[k] && k !='imageId' && k !='competenceId' && k !='anticipation' && k !='missions' && k != 'dateArrivee' && k !='rawFile' && k !='competenceFile' && k !='avatar' && k !='avatarType' && k != 'dateInscription' && k != 'trigramme' && k !='id' && k !='cpNMoins1'&& k !='rttn' && k !='cpN' && k !='dateDepart' && k !='derniereConnexion' && k !='role' && k !='fonction' && k !='statut' && k !='congeAnciennete'){
              let key = k.toString();
              let val = this.editForm.value[k];
              details.push({[this.keysDict[key]]:val});
            }
            if(k.toString() == 'dateArrivee' && new Date(this.formerUser[k]).toString() != this.editForm.value[k].toString()){
              details.push({[this.keysDict[k.toString()]]:this.editForm.value[k]});
            }
          }
          let sDetails = "";
          for(let ob of details){
            let sLine = Object.keys(ob)[0] + " : "+ob[Object.keys(ob)[0]]+"\n";
            sDetails += sLine;
          }
          this.user.rttn = +this.editForm.value.rttn.toString().replace(",",".");
          this.user.cpNMoins1 = +this.editForm.value.cpNMoins1.toString().replace(",",".");
          this.user.cpN = +this.editForm.value.cpN.toString().replace(",",".");
          this.user.congeAnciennete = +this.editForm.value.congeAnciennete.toString().replace(",",".");
          this.userService.editUser(this.user)
            .subscribe(data => {
              if(sDetails == ""){
                this.router.navigate(['users/',this.user.id]);
              } else {
                this.emailService.sendMail(this.getHello()+",\n\n"+this.user.prenom + ' ' +this.user.nom + ' a modifié ses infos personnelles sur l\'application : \n' + sDetails,'Notification de changement de situation : '+this.user.prenom + ' ' +this.user.nom, this.recipient).subscribe(
                  ()=> {
                    this.toastr.success('Votre profil a bien été mis à jour. Un e-mail de confirmation a été envoyé au service des Ressources Humaines','Modification effectuée');
                    this.router.navigate(['users/',this.user.id]);
                  },
                  (err)=>console.log(err)
                );
              }
            });
        }
      })
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
          // this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this, file);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          // this.fileValid = true;
        };
      }

      // this.selectedFiles.splice(i,1);
      // i--
    }
  }

  handleFileCompetence(user) {
    let file = user.competenceFile[0];
    if (file) {
      this.dossierFilename=file.file.name;
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedCompetenceIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoadedCompetence.bind(this);
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

  _handleReaderLoadedCompetenceIE(readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    this.fileCompEncoded = btoa(binary);
    this.postDossier();
  }

  _handleReaderLoadedCompetence(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileCompEncoded = btoa(readerEvt.target.result);
    this.postDossier();
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
        this.user.imageId = data.id;
        newimg.id = data.id;
      }
    )
  }

  postDossier(){
    this.imageService.uploadJustif({imageJointe: this.fileCompEncoded, imageJointeType: this.dossierFilename.split('.')[this.dossierFilename.split('.').length - 1].toLowerCase(), id: null, originalFilename: this.dossierFilename }).subscribe(
      (data)=>{
        this.fileValid = false;
        this.user.competenceId = data.id;
      }
    )
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

  // public base64ToBlyteArray(b64Data, contentType = '', sliceSize = 512) {
  //   b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
  //   let byteCharacters = atob(b64Data);
  //   let byteArrays = [];
  //   for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     let slice = byteCharacters.slice(offset, offset + sliceSize);
  //     let byteNumbers = new Array(slice.length);
  //     for (var i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }
  //     let byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }
  //   return byteArrays;
  // }

  getDocument(image: ImageModel) {
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    this.imageService.getImage(image.id).subscribe(
      (res) => {
        if (res.imageJointe) {
          let blob = this.base64ToBlob(image.imageJointe, 'application/'+ image.imageJointeType);
          if(!navigator.userAgent.match('CriOS') || !isSafari) {
            saveAs(blob, image.originalFilename);
          } else {
            // let reader = new FileReader();
            // reader.onload = function(e){
            //   window.location.href = reader.result
            // };
            // reader.readAsDataURL(blob);
            window.open(URL.createObjectURL(blob));
          }
        }
      });
  }
}
