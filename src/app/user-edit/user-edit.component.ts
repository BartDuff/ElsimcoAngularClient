import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {UserModel} from '../models/user.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {EmailService} from '../services/email.service';
import {ToastrService} from 'ngx-toastr';

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
              private toastr: ToastrService,
              private dialog: MatDialog) {
  }
  editForm: FormGroup;
  currentUser: UserModel;
  user: UserModel;
  keysDict = {
    id: 'Id',
    email: 'Email professionelle',
    prenom: 'Prénom',
    nom: 'Nom',
    role: 'Rôle',
    fonction: 'Fonction',
    trigramme: 'Trigramme',
    cpNMoins1: 'Compteur CP N-1',
    cpN: 'Compteur CP N',
    rttn: 'Conpteur RTT',
    congeAnciennete: 'Congés Ancienneté',
    adressePostale:'Adresse postale',
    telephone:'Téléphone',
    telPro: 'Téléphone Pro',
    emailPerso:'Email perso',
    dateArrivee:'Date d\'arrivée',
    metier:'Métier'};

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
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.email.setValue(data.email);
          this.editForm.controls.prenom.setValue(data.prenom);
          this.editForm.controls.nom.setValue(data.nom);
          this.editForm.controls.trigramme.setValue(data.trigramme);
          this.editForm.controls.adressePostale.setValue(data.adressePostale);
          this.editForm.controls.telephone.setValue(data.telephone);
          this.editForm.controls.telPro.setValue(data.telPro);
          this.editForm.controls.emailPerso.setValue(data.emailPerso);
          this.editForm.controls.dateArrivee.setValue(new Date(data.dateArrivee));
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
            if(this.user[k] != this.editForm.value[k] && k !='missions' && k != 'dateArrivee' && k != 'dateInscription' && k != 'trigramme' && k !='id' && k !='cpNMoins1'&& k !='rttn' && k !='cpN' && k !='dateDepart' && k !='derniereConnexion' && k !='role' && k !='fonction' && k !='congeAnciennete'){
              let key = k.toString();
              let val = this.editForm.value[k];
              details.push({[this.keysDict[key]]:val});
            }
            if(k.toString() == 'dateArrivee' && new Date(this.user[k]).toString() != this.editForm.value[k].toString()){
              details.push({[this.keysDict[k.toString()]]:this.editForm.value[k]});
            }
          }
          let sDetails = "";
          for(let ob of details){
            let sLine = Object.keys(ob)[0] + " : "+ob[Object.keys(ob)[0]]+"\n";
            sDetails += sLine;
          }
          this.userService.editUser(this.editForm.value)
            .subscribe(data => {
              if(sDetails == ""){
                this.router.navigate(['users/',this.user.id]);
              } else {
                this.emailService.sendMail(this.user.prenom + ' ' +this.user.nom + ' a modifié ses infos personnelles sur l\'application: \n' + sDetails,'Notification de changement de situation: '+this.user.prenom + ' ' +this.user.nom, "majoline.domingos@elsimco.com").subscribe(
                  ()=> {
                    this.toastr.success('Vos infos ont bien été modifiées. \nUn mail d\'information a été envoyé aux RH','Modification effectuée');
                    this.router.navigate(['users/',this.user.id]);
                  },
                  (err)=>console.log(err)
                );
              }
            });
        }
      })
  }
}
