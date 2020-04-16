import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ContactService} from '../services/contact.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {InputFileComponent} from 'ngx-input-file';
import {ContactModel} from '../models/contact.model';
import {environment} from '../../environments/environment';
import {Diplome} from '../models/diplome.model';
import {Reference} from '../models/reference.model';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css']
})

export class AddContactComponent implements OnInit {
  envBase = environment.base;
  contactForm: FormGroup;
  message: string;
  submitted: boolean;
  loading: boolean = false;
  fileEncoded:String;
  fileType:String;
  fileName:String;

  @ViewChild(InputFileComponent) fileInput: InputFileComponent;

  constructor(private formBuilder: FormBuilder,
              private contactService: ContactService,
              private router: Router,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      civilite: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      mobile: ['',[Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
      posteRecherche: ['', Validators.required],
      fileBase64: ['']
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  sendCV() {
    this.loading = true;
  }

  sendInfos() {
    // setTimeout(() => {
    //   this.loading = false;
    // }, 1000);
    this.loading = true;
    let c:ContactModel = new ContactModel();
    c.nom = this.contactForm.controls.nom.value;
    c.prenom = this.contactForm.controls.prenom.value;
    c.civilite = this.contactForm.controls.civilite.value;
    c.email = this.contactForm.controls.email.value;
    c.mobile = this.contactForm.controls.mobile.value;
    c.posteRecherche = "";
    for (let i = 0; i< this.contactForm.controls.posteRecherche.value.length; i++){
      c.posteRecherche += this.contactForm.controls.posteRecherche.value[i];
      if(i < this.contactForm.controls.posteRecherche.value.length - 1){
        c.posteRecherche += ", ";
      }
    }
    c.fileBase64 = this.fileEncoded;
    c.fileName = this.fileName;
    c.fileType = this.fileType;
    this.contactService.addContact(c)
      .subscribe(data => {
        this.loading = false;
        this.router.navigate(['login']);
        this.toastrService.success('Vos informations ont bien été envoyées!', 'Contact');},
        error => {
          this.toastrService.error("Erreur", "Erreur");
          console.log(error);
        });
  }

  onFileChange() {
    for(let i=0; i < this.fileInput.files.length;i++) {
      let file = this.fileInput.files[i];
      // if (file.file.type !== 'application/pdf'){
      //   this.fileInput.placeholder = "Le fichier doit etre en PDF";
      //   this.fileInput.files.splice(i,1);
      // }
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
        this.fileName = file.file.name;
        this.fileType = this.fileName.split('.')[file.file.name.split('.').length - 1];
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
        this.fileName = file.file.name;
        this.fileType = this.fileName.split('.')[file.file.name.split('.').length - 1];
      }
    }
  }

  _handleReaderLoadedIE(event) {
    let bytes = new Uint8Array(event.target.result);
    let binary = "";
    let length = bytes.byteLength;
    for (let i = 0; i < length; i++)
      binary += String.fromCharCode(bytes[i]);
    this.fileEncoded = btoa(binary);
  }

  _handleReaderLoaded(event) {
    this.fileEncoded = btoa(event.target.result);
  }

}
