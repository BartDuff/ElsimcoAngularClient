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
  filename;
  fileValid = true;
  keysDict = {
    id: 'Id',
    email: 'Email professionelle',
    prenom: 'Prénom',
    nom: 'Nom',
    role: 'Rôle',
    imageId: 'Image Id',
    fonction: 'Fonction',
    trigramme: 'Trigramme',
    cpNMoins1: 'Compteur CP N-1',
    cpN: 'Compteur CP N',
    rttn: 'Conpteur RTT',
    congeAnciennete: 'Congés Ancienneté',
    adressePostale:'Adresse postale',
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
      trigramme:[''],
      cpNMoins1:[''],
      cpN:[''],
      rttn:[''],
      congeAnciennete:[''],
      adressePostale:[''],
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
          // if(data.avatar != null ) {
          //   this.user.rawFile.push({'file': new File([this.base64ToBlob(data.avatar)], 'exemple.' + data.avatarType, {type: 'image/' + data.avatarType})});
          // }
          if(data.imageId){
            this.imageService.getImage(data.imageId).subscribe(
              (image)=>{
                this.base64downoad = image;
                this.user.rawFile.push({'file': new File([this.base64ToBlob(image.imageJointe)], image.originalFilename.toString(), {type: 'image/' + image.imageJointeType})});
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
          this.editForm.controls.telephone.setValue(data.telephone);
          this.editForm.controls.telPro.setValue(data.telPro);
          this.editForm.controls.emailPerso.setValue(data.emailPerso);
          // this.editForm.controls.dateArrivee.setValue(new Date(data.dateArrivee));
          this.editForm.controls.metier.setValue(data.metier);
          this.editForm.controls.role.setValue(data.role);
          this.editForm.controls.fonction.setValue(data.fonction);
          this.editForm.controls.cpNMoins1.setValue(data.cpNMoins1);
          this.editForm.controls.cpN.setValue(data.cpN);
          this.editForm.controls.rttn.setValue(data.rttn);
          this.editForm.controls.rttn.setValue(data.congeAnciennete);
        }
      )
    );

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
            if(this.formerUser[k] != this.editForm.value[k] && k !='imageId' && k !='anticipation' && k !='missions' && k != 'dateArrivee' && k !='rawFile' && k !='avatar' && k !='avatarType' && k != 'dateInscription' && k != 'trigramme' && k !='id' && k !='cpNMoins1'&& k !='rttn' && k !='cpN' && k !='dateDepart' && k !='derniereConnexion' && k !='role' && k !='fonction' && k !='congeAnciennete'){
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
          this.userService.editUser(this.user)
            .subscribe(data => {
              if(sDetails == ""){
                this.router.navigate(['users/',this.user.id]);
              } else {
                this.emailService.sendMail(this.user.prenom + ' ' +this.user.nom + ' a modifié ses infos personnelles sur l\'application: \n' + sDetails,'Notification de changement de situation: '+this.user.prenom + ' ' +this.user.nom, "majoline.domingos@elsimco.com").subscribe(
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
    this.filename=file.file.name;
    if (file) {
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          // user.avatar = this.fileEncoded;
          // this.fileEncoded = null;
          // user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
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

  _handleReaderLoadedIE(readerEvt) {
    console.log('_handleReaderLoadedIE');
    var bytes = new Uint8Array(readerEvt.target.result);
    var binary = '';
    var length = bytes.byteLength;
    for (var i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.fileEncoded = btoa(binary);
    this.postImage();
  }

  _handleReaderLoaded(readerEvt) {
    //console.log ("xx"+this.inputFileComponent.files[this.i].file.name,this.i);
    this.fileEncoded = btoa(readerEvt.target.result);
    this.postImage();
  }

  postImage(){
    this.imageService.uploadImage({imageJointe: this.fileEncoded, imageJointeType: this.filename.split('.')[this.filename.split('.').length - 1].toLowerCase(), id: null, originalFilename: this.filename }).subscribe(
      (data)=>{
        this.fileValid = false;
        this.user.imageId = data.id;
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
