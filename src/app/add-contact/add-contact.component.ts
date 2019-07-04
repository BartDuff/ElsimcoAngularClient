import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ContactService} from '../services/contact.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {InputFileComponent} from 'ngx-input-file';
import {ContactModel} from '../models/contact.model';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.css']
})
export class AddContactComponent implements OnInit {
  contactForm: FormGroup;
  message: string;
  submitted: boolean;
  loading: boolean = false;
  fileEncoded:String;

  @ViewChild(InputFileComponent) fileInput: InputFileComponent;

  constructor(private formBuilder: FormBuilder,
              private contactService: ContactService,
              private router: Router,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', Validators.required],
      adresse: ['', Validators.required],
      codePostal: ['', Validators.required],
      ville: ['', Validators.required],
      mobile: ['', Validators.required],
      fileBase64: ''
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  sendInfos() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 1000);
    let c:ContactModel = this.contactForm.value;
    c.fileBase64 = this.fileEncoded;
    console.log(c);
    this.contactService.addContact(c)
      .subscribe(data => {
        this.router.navigate(['login']);
        this.toastrService.success('Vos informations ont bien été envoyées!', 'Contact');
      });
  }

  onFileChange() {
    for(let i=0; i < this.fileInput.files.length;i++) {
      let file = this.fileInput.files[i];
      if (file.file.type !== 'application/pdf'){
        this.fileInput.placeholder = "Le fichier doit etre en PDF";
        this.fileInput.files.splice(i,1);
      }
      let reader = new FileReader();
      if (reader.readAsBinaryString === undefined) {
        reader.onload = this._handleReaderLoadedIE.bind(this);
        reader.readAsArrayBuffer(file.file);
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file.file);
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
    console.log(event.target.result);
    this.fileEncoded = btoa(event.target.result);
  }

}
