import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {MatDialog, MatDialogConfig, MatPaginator, PageEvent} from '@angular/material';
import {NewsService} from '../services/news.service';
import {UserService} from '../services/user.service';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {MessageForumModel} from '../models/message-forum.model';
import {MessageForumService} from '../services/message-forum.service';
import {NotificationService} from '../services/notification.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../environments/environment';
import {ImageService} from '../services/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {EmailService} from '../services/email.service';
import {CommentDialogComponent} from '../dialog/comment-dialog/comment-dialog.component';
import {RefuseWithCommentComponent} from '../dialog/refuse-with-comment/refuse-with-comment.component';
import {ForumTabService} from '../services/forum-tab.service';

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.css']
})
export class MessagesListComponent implements OnInit, AfterViewInit{
  isParticipating:boolean;
  participants;
  messages: MessageForumModel[];
  besoins: MessageForumModel[];
  experiences: MessageForumModel[];
  afterworks: MessageForumModel[];
  afterworksToValidate: MessageForumModel[];
  answersBesoins: MessageForumModel[] = [];
  answersExperiences: MessageForumModel[] = [];
  answersAfterworks: MessageForumModel[] = [];
  pagedAfterworksToValidate: MessageForumModel[];
  pagedbesoins: MessageForumModel[];
  pagedexperiences: MessageForumModel[];
  pagedafterworks: MessageForumModel[];
  pagedMessages: MessageForumModel[];
  currentUser: UserModel;
  selectedTab:number;
  loading = true;
  bottom;
  top;
  unread:number=0;
  deleteClicked = false;
  length: number = 0;
  pageSize: number = 5;
  @ViewChild('topBesoins') paginatorTopBesoins: MatPaginator;
  @ViewChild('bottomBesoins') paginatorBottomBesoins: MatPaginator;
  @ViewChild('topExperience') paginatorTopExperiences: MatPaginator;
  @ViewChild('bottomExperience') paginatorBottomExperiences: MatPaginator;
  @ViewChild('topAfterworks') paginatorTopAfterworks: MatPaginator;
  @ViewChild('bottomAfterworks') paginatorBottomAfterworks: MatPaginator;
  @ViewChild('topAfterworksToValidate') paginatorTopAfterworksToValidate: MatPaginator;
  @ViewChild('bottomAfterworksToValidate') paginatorBottomAfterworksToValidate: MatPaginator;


  constructor(private messageService: MessageForumService,
              private notificationService: NotificationService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              private toastr: ToastrService,
              private userService: UserService,
              private emailService: EmailService,
              private dialog: MatDialog,
              private forumTabService: ForumTabService) {
  }

  ngOnInit() {
    this.forumTabService.previousTab.subscribe(
      (index)=>this.selectedTab = index
    )
    this.getBesoins();
    this.getExperiences();
    this.getAfterworks();
    this.getAfterworksToValidate();
    this.getAnswers();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.messageService.getMessages().subscribe(
      (messages)=>{
        this.messageService._forumMessages.next(messages.filter((h:MessageForumModel) => h.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1 && h.type == 'origin' && h.valideAdmin));
      }
    )
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

  filterByOriginId(array: any[], id: number){
    return array.filter((x)=> x.originId == id)
  }

  filterByUserId(array: any[]){
    if(array){
      return array.filter((x)=> x.auteur.id == this.currentUser.id)
    } else {
      return [];
    }
  }

  emitSelectedTab(num:number){
    this.forumTabService.previousTab.next(num);
  }

  createTextLinks_(text) {
    let pattern = /(\d{10})|(\+33\d{9})|(\+33\s\d{1}\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(0\s\d{3}\s\d{3}\s\d{3}\s)|(0\s\d{3}\s\d{2}\s\d{2}\s\d{2}\s)|(0\d{3}\s\d{3}\s\d{3}\s)|(0\d{3}\s\d{2}\s\d{2}\s\d{2}\s)/gi;
    return (text || "")
      .replace(
        /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
        function(match, space, url){
          let hyperlink = url;
          if (!hyperlink.match('^https?:\/\/')) {
            hyperlink = 'http://' + hyperlink;
          }
          return space + '<a class="links" href="' + hyperlink + '" target="_blank">' + url + '</a>';
        }
      )
      .replace(
        pattern,
        function(match2){
          return '<a class="showOnMobile links" href="tel:' + match2 + '">' + match2 + '</a>'+'<span class="hideOnMobile">'+match2+'</span>';
        }
      );
  };

  ngAfterViewInit(){
    this.paginatorTopBesoins._intl.itemsPerPageLabel = 'Messages par page : ';
    this.paginatorTopBesoins._intl.nextPageLabel = 'Page suivante';
    this.paginatorTopBesoins._intl.previousPageLabel = 'Page précédente';
    this.paginatorTopBesoins._intl.firstPageLabel = 'Première page';
    this.paginatorTopBesoins._intl.lastPageLabel = 'Dernière page';
    this.paginatorTopBesoins._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottomBesoins = this.paginatorTopBesoins;
    this.paginatorTopExperiences._intl.itemsPerPageLabel = 'Messages par page : ';
    this.paginatorTopExperiences._intl.nextPageLabel = 'Page suivante';
    this.paginatorTopExperiences._intl.previousPageLabel = 'Page précédente';
    this.paginatorTopExperiences._intl.firstPageLabel = 'Première page';
    this.paginatorTopExperiences._intl.lastPageLabel = 'Dernière page';
    this.paginatorTopExperiences._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottomExperiences = this.paginatorTopExperiences;
    this.paginatorTopAfterworks._intl.itemsPerPageLabel = 'Messages par page : ';
    this.paginatorTopAfterworks._intl.nextPageLabel = 'Page suivante';
    this.paginatorTopAfterworks._intl.previousPageLabel = 'Page précédente';
    this.paginatorTopAfterworks._intl.firstPageLabel = 'Première page';
    this.paginatorTopAfterworks._intl.lastPageLabel = 'Dernière page';
    this.paginatorTopAfterworks._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottomAfterworks = this.paginatorTopAfterworks;
    this.paginatorTopAfterworksToValidate._intl.itemsPerPageLabel = 'Messages par page : ';
    this.paginatorTopAfterworksToValidate._intl.nextPageLabel = 'Page suivante';
    this.paginatorTopAfterworksToValidate._intl.previousPageLabel = 'Page précédente';
    this.paginatorTopAfterworksToValidate._intl.firstPageLabel = 'Première page';
    this.paginatorTopAfterworksToValidate._intl.lastPageLabel = 'Dernière page';
    this.paginatorTopAfterworksToValidate._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottomAfterworksToValidate = this.paginatorTopAfterworksToValidate;
  }

  getRangeLabel = (page: number, pageSize: number, length: number) =>  {
    if (length === 0 || pageSize === 0) {
      return `0 / ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} sur ${length}`;
  };

  getMessages() {
    this.messageService.getMessages().subscribe(
      (data) => {
        this.messages = data;
        for(let message of this.messages){
          this.imageService.getImage(message.auteur.imageId).subscribe(
            (image) => {
              message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
        }
        this.loading=false;
        this.length = this.messages.length;
      },
      ()=>{},
      ()=>{
        this.pagedMessages = this.messages.slice(0,this.pageSize);
      }
    );
  }

  getExperiences() {
    this.messageService.getExperiences().subscribe(
      (data) => {
        this.experiences = data.filter((a) => a.type == "origin");
        for(let message of this.experiences){
          this.imageService.getImage(message.auteur.imageId).subscribe(
            (image) => {
              message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
          if(message.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1){
            this.unread +=1;
          }
        }
        this.loading=false;
        this.length = this.experiences.length;
      },
      ()=>{},
      ()=>{
        this.pagedexperiences = this.experiences.slice(0,this.pageSize);
      }
    );
  }

  getBesoins() {
    this.messageService.getBesoins().subscribe(
      (data) => {
        this.besoins = data.filter((a) => a.type == "origin");
        for(let message of this.besoins){
          this.imageService.getImage(message.auteur.imageId).subscribe(
            (image) => {
              message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
          if(message.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1){
            this.unread +=1;
          }
        }
        this.loading=false;
        this.length = this.besoins.length;
      },
      ()=>{},
      ()=>{
        this.pagedbesoins = this.besoins.slice(0,this.pageSize);
      }
    );
  }

  getAfterworks() {
    this.messageService.getAfterworks().subscribe(
      (data) => {
        this.afterworks = data.filter((a) => a.type == "origin" && a.valideAdmin);
        for(let message of this.afterworks){
          this.imageService.getImage(message.auteur.imageId).subscribe(
            (image) => {
              message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
          this.getParticipants(message);
          if(message.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1){
            this.unread +=1;
          }
        }
        this.loading=false;
        this.length = this.afterworks.length;
      },
      ()=>{},
      ()=>{
        this.pagedafterworks = this.afterworks.slice(0,this.pageSize);
      }
    );
  }

  getAfterworksToValidate() {
    this.messageService.getAfterworks().subscribe(
      (data) => {
        this.afterworksToValidate = data.filter((a) => a.type == "origin" && !a.valideAdmin);
        for(let message of this.afterworksToValidate){
          this.imageService.getImage(message.auteur.imageId).subscribe(
            (image) => {
              message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
        }
        this.loading=false;
        this.length = this.afterworksToValidate.length;
      },
      ()=>{},
      ()=>{
        this.pagedAfterworksToValidate = this.afterworksToValidate.slice(0,this.pageSize);
      }
    );
  }

  triggerSms(){
    this.notificationService.sendSms("Test : Une nouvelle actualité est disponible sur l'application : https://app.elsimco.com", "").subscribe(
      ()=>{
        this.toastr.success("Envoyé avec succès!");
      }
    )
  }

  OnPageChange(event: PageEvent, paginator, type){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    switch (type){
      case "Besoins":
        if(endIndex > this.besoins.length){
          endIndex = this.besoins.length;
        }
        this.pagedbesoins = this.besoins.slice(startIndex, endIndex);
        break;
      case "Experiences":
        if(endIndex > this.experiences.length){
          endIndex = this.experiences.length;
        }
        this.pagedexperiences = this.experiences.slice(startIndex, endIndex);
        break;
      case "Afterworks":
        if(endIndex > this.afterworks.length){
          endIndex = this.afterworks.length;
        }
        this.pagedafterworks = this.afterworks.slice(startIndex, endIndex);
        break;
      case "AfterworksToValidate":
        if(endIndex > this.afterworksToValidate.length){
          endIndex = this.afterworksToValidate.length;
        }
        this.pagedAfterworksToValidate = this.afterworksToValidate.slice(startIndex, endIndex);
        break;
      default:
        this.pagedMessages = this.messages.slice(startIndex, endIndex);
        break;
    }
    paginator.pageIndex = event.pageIndex;
  }

  validateMessage(message: MessageForumModel){
    message.valideAdmin = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data)=>{
        if(data){
          this.messageService.editMessage(message).subscribe(
            ()=>{
              this.emailService.sendMail(this.getHello() + " " + message.auteur.prenom + ",\n\nVotre fil de discussion vient d'être validé par un administrateur, il sera désormais visible de tous dans la rubrique Afterworks du forum.","Fil de discussion validé",message.auteur.email).subscribe(
                ()=>{
                  this.toastr.success("Fil de discussion validé","Validation");
                  this.getAfterworks();
                  this.getAfterworksToValidate();
                }
              )
            }
          )
        }
      });
  }

  checkUnread(message: MessageForumModel, array:MessageForumModel[]){
    let arrayToFilter:MessageForumModel[] = this.filterByOriginId(array,message.id);
    if(arrayToFilter.length>0){
      for (let mess of arrayToFilter){
        if(mess.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1){
          return true
        }
      }
    }
    return message.readByUserIds.split(',').indexOf(this.currentUser.id.toString()) == -1;
  }

  deleteMessage(messageToDelete) {
    messageToDelete.valideAdmin = false;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(RefuseWithCommentComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.messageService.deleteMessage(messageToDelete).subscribe(
            () => {
              this.emailService.sendMail(this.getHello() + " " + messageToDelete.auteur.prenom + ",\n\nVotre fil de discussion vient d'être refusé par un administrateur pour la raison suivante : " + data.commentaire +"\nMerci de prendre note de la raison du refus si vous souhaitez publier un nouveau fil de discussion.","Fil de discussion refusé",messageToDelete.auteur.email).subscribe(
                ()=>{
                  this.toastr.error("Fil de discussion refusé","Refus")
                  this.getAfterworks();
                  this.getAfterworksToValidate();
                });
            }
          );
        }
      }
    );
  }

  deleteOriginMessage(messageToDelete) {
    this.deleteClicked = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.messageService.deleteMessage(messageToDelete).subscribe(
            () => {
                  this.toastr.error("Fil de discussion supprimé","Suppression");
                  this.deleteClicked = false;
                  this.getBesoins();
                  this.getExperiences()
                  this.getAfterworks();
                });
            } else {
          this.deleteClicked = false;
        }
      }
    );
  }

  getAnswers() {
    this.messageService.getMessages().subscribe(
      (data) => {
        for (let d of data) {
          if (d.type == "answer") {
            switch (d.categorie){
              case "Besoins":
                this.answersBesoins.push(d);
                break;
              case "Experiences":
                this.answersExperiences.push(d);
                break;
              case "Afterworks":
                this.answersAfterworks.push(d);
                break;
              default:
                break;
            }
          }
        }
      }
    );
  }

  getParticipants(message) {
    this.messageService.getParticipantsForAfterwork(message).subscribe(
      (data)  => {
        message.participants = data;
        message.isParticipating = message.participants.find(x => x.id === this.currentUser.id) !== undefined;
      }
    )
  }

  removeParticipation(message){
    message.isParticipating = false;
    this.deleteClicked = true;
    this.messageService.removeParticipationFromUser(JSON.parse(localStorage.getItem('currentUser')), message).subscribe(
      () => {
        message.participants.splice(message.participants.indexOf(this.currentUser),1)
        this.deleteClicked = false;
      }
    );
  }

  confirmParticipation(message){
    message.isParticipating = true;
    this.deleteClicked = true;
    this.messageService.addParticipationToUser(JSON.parse(localStorage.getItem('currentUser')), message).subscribe(
      () => {
        message.participants.push(this.currentUser);
        this.deleteClicked = false;
      }
    );
  }

}
