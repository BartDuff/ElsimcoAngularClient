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
import {AfterworkModel} from '../models/afterwork.model';
import {DatePipe} from '@angular/common';

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
              private dialog: MatDialog,
              private datepipe: DatePipe) { }

  @ViewChild(InputFileComponent)
  private inputFileComponent: InputFileComponent;
  addForm: FormGroup;
  currentUser: UserModel;
  message: MessageForumModel;
  loading = false;
  selected;
  adminRecipient;
  // adminRecipient = "florian.bartkowiak@gmail.com";
  categories = ["Besoins Elsimco", "Transfert d'expérience", "Afterworks"];
  catShort = ['Besoins', 'Experiences', 'Afterworks'];
  messageType;
  afterworkMessage:AfterworkModel;
  organise;


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
    this.afterworkMessage = new AfterworkModel("","","","", 0,"");
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.organise = this.currentUser.role == "ADMIN"?"Elsimco organise":"J'organise";
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
    this.addForm.controls.categorie.setValue(this.selected);
  }

  // updateAfterworkModel(afterworkMessage){
  //   this.afterworkMessage = afterworkMessage;
  //   let organise = this.currentUser.role == "ADMIN"?"Elsimco organise":"J'organise";
  //   this.messageType = "Salut la team Elsimco,\n" +
  //     "\n" +
  //     organise+" un afterwork qui aura lieu "+this.afterworkMessage.lieu+" le "+this.afterworkMessage.date+" à\n" +
  //     this.afterworkMessage.heure+"H"+this.afterworkMessage.minutes+" pour un budget de "+this.afterworkMessage.budget+"€/pers.\n" +
  //     "\n" +
  //     "Si tu souhaites y participer, clique sur « Je participe ! »\n" +
  //     "\n" +
  //     this.afterworkMessage.commentaire+
  //     "\n\n" +
  //     "À bientôt.\n" +
  //     "\n" +
  //     this.currentUser.prenom;
  // }

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
          if(message.categorie == "Afterworks"){
              this.messageType = "Salut la team Elsimco,\n" +
                "\n" +
                this.organise+" un afterwork qui se déroulera dans le lieu suivant : "+this.afterworkMessage.lieu+" le "+this.datepipe.transform(this.afterworkMessage.date,"dd/MM/yyyy")+" à " + this.datepipe.transform(this.afterworkMessage.date,"HH")+"H"+this.datepipe.transform(this.afterworkMessage.date,"mm")+" pour un budget de "+this.afterworkMessage.budget+"€/pers.\n" +
                "Inscris-toi en cliquant sur « Je participe ! »\n" +
                "\n" +
                this.afterworkMessage.commentaire+
                "\n\n" +
                "À bientôt.\n" +
                "\n" +
                this.currentUser.prenom;
              message.message = this.messageType;
              message.sujet = "Afterwork " + this.datepipe.transform(this.afterworkMessage.date,"dd/MM/yyyy") + " : "+ this.afterworkMessage.lieu;
          }
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
                          this.toastrService.warning("Votre proposition d'Afterwork est maintenant soumise à validation", "Publication");
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
