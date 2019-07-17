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
  contactForm1: FormGroup;
  contactForm2: FormGroup;
  contactForm3: FormGroup;
  contactForm4: FormGroup;
  contactForm5: FormGroup;
  contactForm6: FormGroup;
  contactForm7: FormGroup;
  contactForm8: FormGroup;
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
    this.contactForm1 = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: [''],
      nationalite:[''],
      villeNaissance:[''],
      departementNaissance:[''],
      telDomicile:[''],
      numSecu:[''],
      skype:[''],
      email: ['', [Validators.email, Validators.required]],
      adresse: ['', Validators.required],
      codePostal: ['', Validators.required],
      ville: ['', Validators.required],
      mobile: ['', Validators.required],
      transport: [''],
      fileBase64: ['']
    });
    this.contactForm2 = this.formBuilder.group({
      Id:[''],
      annee: [''],
      intitule: [''],
      etablissement: [''],
      obtenu: ['', Validators.required]
    });
    this.contactForm3 = this.formBuilder.group({
      anglais: [''],
      italien: [''],
      allemand: [''],
      espagnol: [''],
      autreLangue: [''],
      niveauAutreLangue: ['']
    });
    this.contactForm4 = this.formBuilder.group({
      mobiliteParis: ['', Validators.required],
      mobiliteFrance: ['', Validators.required],
      mobiliteEurope: ['', Validators.required],
      mobiliteIntl: ['', Validators.required]
    });
    this.contactForm5 = this.formBuilder.group({
      nomEntreprise1: [''],
      nomEntreprise2: [''],
      nomResponsable1: [''],
      nomResponsable2: [''],
      fonction1: [''],
      fonction2: [''],
      telephone1: [''],
      telephone2: [''],
      adresseMail1: [''],
      adresseMail2: ['']
    });
    this.contactForm6 = this.formBuilder.group({
      enPoste: ['', Validators.required],
      contrat: [''],
      preavisNegociable: [''],
      delai: [''],
      raisonDispo: [''],
      posteSouhaite: [''],
      evolution5ans: [''],
      dateDispo: ['']
    });
    this.contactForm7 = this.formBuilder.group({
      fixeDernierSalaireBrut: ['', Validators.required],
      varDernierSalaireBrut: [''],
      pretentionSalaireBrut: [''],
    });
    this.contactForm8 = this.formBuilder.group({
      acceptTerms: ['', Validators.required],
      faitA: ['', Validators.required]
    });
  }

  get f() {
    return this.contactForm1.controls;
  }

  sendCV() {
    this.loading = true;
    console.log(this.contactForm1.controls.transport);
  }

  sendInfos() {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
    let c:ContactModel = this.contactForm8.value;
    c.nom = this.contactForm1.controls.nom.value;
    c.prenom = this.contactForm1.controls.prenom.value;
    c.dateNaissance = this.contactForm1.controls.dateNaissance.value;
    c.nationalite = this.contactForm1.controls.nationalite.value;
    c.villeNaissance = this.contactForm1.controls.villeNaissance.value;
    c.departementNaissance = this.contactForm1.controls.departementNaissance.value;
    c.telDomicile = this.contactForm1.controls.telDomicile.value;
    c.numSecu = this.contactForm1.controls.numSecu.value;
    c.skype = this.contactForm1.controls.skype.value;
    c.email = this.contactForm1.controls.email.value;
    c.adresse = this.contactForm1.controls.adresse.value;
    c.codePostal = this.contactForm1.controls.codePostal.value;
    c.ville = this.contactForm1.controls.codePostal.value;
    c.mobile = this.contactForm1.controls.mobile.value;
    c.permisB = this.contactForm1.controls.transport.value.includes("permisB");
    c.voiture = this.contactForm1.controls.transport.value.includes("voiture");
    c.permis2roues = this.contactForm1.controls.transport.value.includes("permis2roues");
    c.deuxRoues = this.contactForm1.controls.transport.value.includes("deuxRoues");
    c.diplome = this.contactForm2.value;
    c.fileBase64 = this.fileEncoded;
    c.anglais = this.contactForm3.controls.anglais.value;
    c.italien = this.contactForm3.controls.italien.value;
    c.allemand = this.contactForm3.controls.allemand.value;
    c.espagnol = this.contactForm3.controls.espagnol.value;
    c.autreLangue = this.contactForm3.controls.autreLangue.value;
    c.niveauAutrelangue = this.contactForm3.controls.niveauAutreLangue.value;
    c.references = [];
    let ref1 = new Reference();
    ref1.nomEntreprise = this.contactForm5.controls.nomEntreprise1.value;
    ref1.adresseMail = this.contactForm5.controls.adresseMail1.value;
    ref1.fonction = this.contactForm5.controls.fonction1.value;
    ref1.nomResponsable = this.contactForm5.controls.nomResponsable1.value;
    ref1.telephone = this.contactForm5.controls.telephone1.value;
    let ref2 = new Reference();
    ref2.nomEntreprise = this.contactForm5.controls.nomEntreprise2.value;
    ref2.adresseMail = this.contactForm5.controls.adresseMail2.value;
    ref2.fonction = this.contactForm5.controls.fonction2.value;
    ref2.nomResponsable = this.contactForm5.controls.nomResponsable2.value;
    ref2.telephone = this.contactForm5.controls.telephone2.value;
    c.references.push(ref1);
    c.references.push(ref2);
    c.mobiliteParis = this.contactForm4.controls.mobiliteParis.value;
    c.mobiliteFrance = this.contactForm4.controls.mobiliteFrance.value;
    c.mobiliteEurope = this.contactForm4.controls.mobiliteEurope.value;
    c.mobiliteIntl = this.contactForm4.controls.mobiliteIntl.value;
    c.enPoste = this.contactForm6.controls.enPoste.value;
    c.contrat = this.contactForm6.controls.contrat.value;
    c.preavisNegociable = this.contactForm6.controls.preavisNegociable.value;
    c.raisonDispo = this.contactForm6.controls.raisonDispo.value;
    c.posteSouhaite = this.contactForm6.controls.posteSouhaite.value;
    c.evolution5ans = this.contactForm6.controls.evolution5ans.value;
    c.dateDispo = this.contactForm6.controls.dateDispo.value;
    c.fixeDernierSalaireBrut = this.contactForm7.controls.fixeDernierSalaireBrut.value;
    c.varDernierSalaireBrut = this.contactForm7.controls.varDernierSalaireBrut.value;
    c.pretentionSalaireBrut = this.contactForm7.controls.pretentionSalaireBrut.value;
    console.log(c);
    this.contactService.addContact(c)
      .subscribe(data => {
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
