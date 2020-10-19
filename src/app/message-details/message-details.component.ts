import {Component, OnInit, ViewChild} from '@angular/core';
import {MessageForumModel} from '../models/message-forum.model';
import {UserModel} from '../models/user.model';
import {MatDialog, MatDialogConfig, MatPaginator, PageEvent} from '@angular/material';
import {MessageForumService} from '../services/message-forum.service';
import {UserService} from '../services/user.service';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {environment} from '../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ImageService} from '../services/image.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ConfirmationDialogComponent} from '../dialog/confirmation-dialog/confirmation-dialog.component';
import {ToastrService} from 'ngx-toastr';
import {NewsModel} from '../models/news.model';

@Component({
  selector: 'app-message-details',
  templateUrl: './message-details.component.html',
  styleUrls: ['./message-details.component.css']
})
export class MessageDetailsComponent implements OnInit {
  message: MessageForumModel;
  answer:MessageForumModel = new MessageForumModel();
  answers:MessageForumModel[] = [];
  pagedMessages: MessageForumModel[];
  currentUser: UserModel;
  loading = true;
  length: number = 0;
  pageSize: number = 5;
  isParticipating:boolean;
  participants:UserModel[] = [];
  dictCategorie = {
    'Besoins':'Besoins Elsimco',
    'Experiences':'Transfert d\'expérience',
    'Afterworks':'Afterworks'
  }
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;

  constructor(private messageService: MessageForumService,
              private userService: UserService,
              private imageService: ImageService,
              private sanitizer: DomSanitizer,
              private toastr : ToastrService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getMessage();
  }

  ngAfterViewInit(){
    this.paginatorTop._intl.itemsPerPageLabel = 'Articles par page : ';
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
    this.loading = true;
    this.messageService.getMessages().subscribe(
      (data) => {
        for (let d of data) {
          if (d.originId == this.message.id && d.type == "answer") {
            this.answers.push(d);
          }
          this.imageService.getImage(d.auteur.imageId).subscribe(
            (image) => {
              d.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
            }
          );
        }
      },
      (err)=>{},
      ()=>{
        this.loading = false;
      }
    );
  }

  getMessage(){
    this.route.params.subscribe(
      params => this.messageService.getSingleMessage(params['id']).subscribe(
        data => {
          this.message = data;
          this.imageService.getImage(data.auteur.imageId).subscribe(
            (image) => {
              this.message.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
              this.getParticipants();
              // this.getMessages();
            }
          );
        }
      )
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  envoyerReponse(){
    this.answer.originId = this.message.id;
    this.answer.type = "answer";
    this.answer.sujet = this.message.sujet;
    this.answer.categorie = this.message.categorie;
    this.answer.auteur = this.currentUser;
    this.answer.valideAdmin = true;
    this.messageService.addMessage(this.answer).subscribe(
      (data)=>{
        this.imageService.getImage(data.auteur.imageId).subscribe(
          (image) => {
            data.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
          }
        );
        this.answers.unshift(data);
        this.answer.message = "";
        // this.answers = [];
        // this.getMessages();
      }
    )
  }

  updateMessage(message:MessageForumModel){
    this.messageService.editMessage(message).subscribe(
      (data)=>{
        this.imageService.getImage(data.auteur.imageId).subscribe(
          (image) => {
            data.auteur.img = image == null ? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, ' + image.imageJointe);
          }
        );
        this.answers.splice(this.answers.indexOf(message),1);
        this.answers.unshift(data);
        this.toastr.success("Message modifié avec succès","Modification");
        this.answer.message = "";
      }
    )
  }

  deleteMessage(messageToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.messageService.deleteMessage(messageToDelete).subscribe(
            () => {
              this.toastr.error("Message supprimé","Suppression")
              this.answers.splice(this.answers.indexOf(messageToDelete),1);
            });
        }
      }
    );
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

  getParticipants() {
    this.messageService.getParticipantsForAfterwork(this.message).subscribe(
      (data)  => {
        this.participants = data;
        this.isParticipating = this.participants.find(x => x.id === this.currentUser.id) !== undefined;
        this.getMessages();
      }
    )
  }

  removeParticipation(){
    this.isParticipating = false;
    this.participants.splice(this.participants.indexOf(this.currentUser),1);
    this.messageService.removeParticipationFromUser(JSON.parse(localStorage.getItem('currentUser')), this.message).subscribe(
      () => {
      }
    );
  }

  confirmParticipation(){
    this.isParticipating = true;
    this.participants.push(this.currentUser);
    this.messageService.addParticipationToUser(JSON.parse(localStorage.getItem('currentUser')), this.message).subscribe(
      () => {
      }
    );
  }

  // OnPageChange(event: PageEvent, paginator){
  //   let startIndex = event.pageIndex * event.pageSize;
  //   let endIndex = startIndex + event.pageSize;
  //   if(endIndex > this.length){
  //     endIndex = this.length;
  //   }
  //   this.pagedMessages = this.messages.slice(startIndex, endIndex);
  //   paginator.pageIndex = event.pageIndex;
  // }

  // deleteMessage(messageToDelete) {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(
  //     (data) => {
  //       if (data) {
  //         this.messageService.deleteMessage(messageToDelete).subscribe(
  //           () => {
  //             this.messages.splice(this.messages.indexOf(messageToDelete), 1);
  //           }
  //         );
  //       }
  //     }
  //   );
  // }

}
