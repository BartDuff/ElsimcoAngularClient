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

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.css']
})
export class MessagesListComponent implements OnInit, AfterViewInit{

  messages: MessageForumModel[];
  besoins: MessageForumModel[];
  experiences: MessageForumModel[];
  afterworks: MessageForumModel[];
  afterworksToValidate: MessageForumModel[];
  pagedAfterworksToValidate: MessageForumModel[];
  pagedbesoins: MessageForumModel[];
  pagedexperiences: MessageForumModel[];
  pagedafterworks: MessageForumModel[];
  pagedMessages: MessageForumModel[];
  currentUser: UserModel;
  loading = true;
  bottom;
  top;
  length: number = 0;
  pageSize: number = 5;
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;


  constructor(private messageService: MessageForumService,
              private notificationService: NotificationService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              private toastr: ToastrService,
              private userService: UserService,
              private emailService: EmailService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    // this.getMessages();
    this.getBesoins();
    this.getExperiences();
    this.getAfterworks();
    this.getAfterworksToValidate()
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    this.paginatorTop._intl.itemsPerPageLabel = 'Messages par page : ';
    this.paginatorTop._intl.nextPageLabel = 'Page suivante';
    this.paginatorTop._intl.previousPageLabel = 'Page précédente';
    this.paginatorTop._intl.firstPageLabel = 'Première page';
    this.paginatorTop._intl.lastPageLabel = 'Dernière page';
    this.paginatorTop._intl.getRangeLabel = this.getRangeLabel;
    this.paginatorBottom = this.paginatorTop;
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

  OnPageChange(event: PageEvent, paginator){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if(endIndex > this.length){
      endIndex = this.length;
    }
    this.pagedMessages = this.messages.slice(startIndex, endIndex);
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

}
