import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {withIdentifier} from 'codelyzer/util/astQuery';
import {from} from 'rxjs';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private userService: UserService) { }

  addForm: FormGroup;
  user: UserModel;
  fileEncoded;
  fileValid = true;
  filename;

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
      trigramme:['', Validators.required],
      cpNMoins1:['', Validators.required],
      cpN:['', Validators.required],
      rttn:['', Validators.required],
      congeAnciennete:[''],
      adressePostale:['', Validators.required],
      telephone:['', [Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
      telPro:['', [Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
      emailPerso:['', [Validators.email, Validators.required]],
      dateArrivee:['', Validators.required],
      metier:['', Validators.required]
    });

  }

  onSubmit() {
    this.user.email = this.f.email;
    this.user.prenom = this.f.prenom;
    this.user.nom = this.f.nom;
    this.user.trigramme = this.f.trigramme;
    this.user.cpNMoins1 = this.f.cpNMoins1;
    this.user.cpN = this.f.cpN;
    this.user.rttn = this.f.rttn;
    this.user.congeAnciennete = this.f.congeAnciennete;
    this.user.adressePostale = this.f.adressePostale;
    this.user.telephone = this.f.telephone;
    this.user.telPro = this.f.telPro;
    this.user.emailPerso = this.f.emailPerso;
    this.user.dateArrivee = this.f.dateArrivee;
    this.user.metier = this.f.metier;
    this.user.role = this.addForm.get('role').value;
    this.user.fonction = this.addForm.get('fonction').value;
    this.userService.addUser(this.user)
      .subscribe( data => {
        this.router.navigate(['users']);
      });
  }

  handleFile(user) {
    let file = user.rawFile[0];
    if (file) {
      this.fileValid = false;
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        reader.onloadend = () => {
          user.avatar = this.fileEncoded;
          this.fileEncoded = null;
          user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
          this.fileValid = true;
        };
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        reader.onloadend = () => {
          user.avatar = this.fileEncoded;
          this.fileEncoded = null;
          user.avatarType = file.file.name.split('.')[file.file.name.split('.').length - 1];
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
