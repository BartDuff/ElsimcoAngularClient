import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ContactService} from '../services/contact.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {InputFileComponent} from 'ngx-input-file';
import {ContactModel} from '../models/contact.model';
import {environment} from '../../environments/environment';
import {Diplome} from '../models/diplome.model';
import {Reference} from '../models/reference.model';
import {CandidatModel} from '../models/candidat.model';
import {CandidatService} from '../services/candidat.service';



@Component({
  selector: 'app-add-candidat',
  templateUrl: './add-candidat.component.html',
  styleUrls: ['./add-candidat.component.css']
})
export class AddCandidatComponent implements OnInit {

  envBase = environment.base;
  contact:ContactModel;
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
              private candidatService: CandidatService,
              private router: Router,
              private route: ActivatedRoute,
              private toastrService: ToastrService) {
  }

  ngOnInit() {
    // localStorage.clear();
    this.contactForm1 = this.formBuilder.group({
      civilite: ['', Validators.required],
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      dateNaissance: [''],
      nationalite:['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      villeNaissance:['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      departementNaissance:[''],
      numSecu:['', Validators.pattern('^([1278])([0-9]{2})(0[1-9]|1[0-2]|20)([02][1-9]|2[AB]|[1345678][0-9]|9[012345789])([0-9]{3})(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})(0[1-9]|[1-8][0-9]|9[1-7])?$')],
      skype:[''],
      email: ['', [Validators.email, Validators.required]],
      adresse: ['', Validators.required],
      codePostal: ['', [Validators.required, Validators.pattern('^(([0-8][0-9])|(9[0-5]))[0-9]{3}$')]],
      ville: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]],
      mobile: ['',[Validators.required, Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')]],
      transport: [''],
      fileBase64: ['']
    });
    this.contactForm2 = this.formBuilder.group({
      Id:[''],
      annee: ['',[Validators.required, Validators.pattern('^[0-9]{4}$')]],
      intitule: ['', Validators.required],
      etablissement: [''],
      obtenu: ['', Validators.required]
    });
    this.contactForm3 = this.formBuilder.group({
      anglais: [''],
      italien: [''],
      allemand: [''],
      espagnol: [''],
      autreLangue: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      niveauAutreLangue: ['']
    });
    this.contactForm4 = this.formBuilder.group({
      mobiliteParis: ['', Validators.required],
      mobiliteFrance: ['', Validators.required],
      regionsFrance:[''],
      mobiliteEurope: ['', Validators.required],
      mobiliteIntl: ['', Validators.required]
    });
    this.contactForm5 = this.formBuilder.group({
      nomEntreprise1: [''],
      nomEntreprise2: [''],
      nomResponsable1: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      nomResponsable2: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      fonction1: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      fonction2: ['', Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')],
      telephone1: ['', Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')],
      telephone2: ['', Validators.pattern('(\\+\\d+(\\s|-))?0\\d(\\s|-)?(\\d{2}(\\s|-)?){4}')],
      adresseMail1: ['', Validators.email],
      adresseMail2: ['', Validators.email],
      autorisationControle: ['', Validators.required]
    });
    this.contactForm6 = this.formBuilder.group({
      enPoste: ['', Validators.required],
      contrat: [''],
      preavisNegociable: [''],
      delai: [''],
      raisonDispo: ['', Validators.required],
      posteSouhaite: ['', Validators.required],
      evolution5ans: ['', Validators.required],
      dateDispo: ['', Validators.required]
    });
    this.contactForm7 = this.formBuilder.group({
      fixeDernierSalaireBrut: ['', [Validators.required, Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')]],
      varDernierSalaireBrut: ['', Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')],
      pretentionSalaireBrut: ['', Validators.pattern('^\\s*(?=.*[1-9])\\d*(?:\\.\\d{1,2})?\\s*$')],
    });
    this.contactForm8 = this.formBuilder.group({
      acceptTerms: ['', Validators.required],
      faitA: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ú\\-\\s]*')]]
    });
    this.route.params.subscribe(
      params => {
        if(!params) {
          this.contact = new ContactModel();
        } else {
          this.contactService.getContact(params['secretid']).subscribe(
            data => {
              this.contact = data;
              this.contactForm1.controls.civilite.setValue(data.civilite);
              this.contactForm1.controls.nom.setValue(data.nom);
              this.contactForm1.controls.prenom.setValue(data.prenom);
              this.contactForm1.controls.email.setValue(data.email);
              this.contactForm1.controls.mobile.setValue(data.mobile);
            }
          );
        }
      }
    );
  }

  get f() {
    return this.contactForm1.controls;
  }

  sendCV() {
    // this.loading = true;
    // console.log(this.contactForm1.controls.transport);
  }

  sendInfos() {
    // setTimeout(() => {
    //   this.loading = false;
    // }, 1000);
    this.loading = true;
    let c:CandidatModel = this.contactForm8.value;
    c.civilite = this.contactForm1.controls.civilite.value;
    c.nom = this.contactForm1.controls.nom.value;
    c.prenom = this.contactForm1.controls.prenom.value;
    c.dateNaissance = this.contactForm1.controls.dateNaissance.value;
    c.nationalite = this.contactForm1.controls.nationalite.value;
    c.villeNaissance = this.contactForm1.controls.villeNaissance.value;
    c.departementNaissance = this.contactForm1.controls.departementNaissance.value;
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
    c.autorisationControle = this.contactForm5.controls.autorisationControle.value;
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
    this.candidatService.addCandidat(c)
      .subscribe(data => {
        this.contactService.deleteContact(this.contact).subscribe(
          ()=>{
            this.loading = false;
            this.router.navigate(['login']);
            this.toastrService.success('Vos informations ont bien été envoyées!', 'Contact');
          },
          () => {
            this.toastrService.error("Erreur", "Erreur");
          });
      }
  );
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
    // console.log(event.target.result);
    this.fileEncoded = btoa(event.target.result);
  }

}
