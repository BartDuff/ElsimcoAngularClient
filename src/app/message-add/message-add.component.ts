import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageService} from '../services/image.service';
import {InputFileComponent} from 'ngx-input-file';
import {UserModel} from '../models/user.model';
import {NewsModel} from '../models/news.model';
import {ImageModel} from '../models/image.model';
import {MessageForumModel} from '../models/message-forum.model';
import {MessageForumService} from '../services/message-forum.service';
import {ToastrService} from 'ngx-toastr';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {EmailService} from '../services/email.service';
import {ConfigurationService} from '../services/configuration.service';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-message-add',
  templateUrl: './message-add.component.html',
  styleUrls: ['./message-add.component.css']
})
export class MessageAddComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private messageService: MessageForumService,
              private toastrService:ToastrService,
              private emailService: EmailService,
              private configurationService: ConfigurationService,
              private dialog: MatDialog) { }

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  addForm: FormGroup;
  currentUser: UserModel;
  message: MessageForumModel;
  loading = false;
  selected;
  adminRecipient;
  categories = ["Besoins Elsimco", "Transfert d'expérience", "Afterworks"];
  catShort = ['Besoins', 'Experiences', 'Afterworks']



  get f() {
    return this.addForm.value;
  }

  changeCaseFirstLetter(params) {
    return params.charAt(0).toUpperCase() + params.slice(1);
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

  ngOnInit() {
    this.message = new MessageForumModel();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.configurationService.getSingleConfiguration("1").subscribe(
      (config)=>{
        this.adminRecipient = config.mailRH;
      }
    );
    this.addForm = this.formBuilder.group({
      id: [],
      sujet: ['', Validators.required],
      message: ['', Validators.required],
      categorie: ['', Validators.required]
    });
    this.selected = this.currentUser.role == "ADMIN"?"Besoins":"Afterworks";
    this.addForm.controls.categorie.setValue(this.selected)
  }

  onSubmit() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.loading = true;
          let message: MessageForumModel = this.f;
          message.auteur = this.currentUser;
          message.type = "origin";
          message.valideAdmin = this.currentUser.role == 'ADMIN';
          this.messageService.addMessage(message)
            .subscribe((data) => {
                message.id = data.id;
                message.originId = data.id;
                message.datePublication = data.datePublication;
                this.messageService.editMessage(message).subscribe(
                  () => {
                    this.loading = false;
                    if (message.valideAdmin == false) {
                      this.emailService.sendMail(this.getHello() + " " + this.changeCaseFirstLetter(this.adminRecipient.split('.')[0]) + ",\n\nUn nouveau fil de discussion Afterworks vient d'être publié par " + message.auteur.prenom + " " + message.auteur.nom + ".\nIl est désormais en attente de validation dans l'onglet 'À valider'.", "Nouveau fil de discussion en attente de validation", this.adminRecipient).subscribe(
                        () => {
                          this.toastrService.warning("Votre fil de discussion a bien été envoyé et sera soumis à validation de la part d'un administrateur avant publication", "Publication");
                        }
                      )
                    } else {
                      this.toastrService.success("Fil de discussion publié", "Publication");
                    }
                    this.router.navigate(['forum']);
                  }
                )
              },
              (error) => console.log(error))
        }
      })
  }

  s(s){
    JSON.stringify(s)
  }


}
