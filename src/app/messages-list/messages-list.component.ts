import {Component, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.css']
})
export class MessagesListComponent implements OnInit {

  messages: MessageForumModel[];
  pagedMessages: MessageForumModel[];
  currentUser: UserModel;
  loading = true;
  length: number = 0;
  pageSize: number = 5;
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;


  constructor(private messageService: MessageForumService,
              private notificationService: NotificationService,
              private toastr: ToastrService,
              private userService: UserService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getMessages();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    this.messageService.getMessages().subscribe(
      (data) => {
        this.messages = data;
        this.loading=false;
        this.length = this.messages.length;
      },
      ()=>{},
      ()=>{
        this.pagedMessages = this.messages.slice(0,this.pageSize);
      }
    );
  }

  triggerSms(){
    this.notificationService.sendSms("Test : Une nouvelle actualité est disponible sur l'application : https://app.elsimco.com").subscribe(
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

  deleteMessage(messageToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.messageService.deleteMessage(messageToDelete).subscribe(
            () => {
              this.messages.splice(this.messages.indexOf(messageToDelete), 1);
            }
          );
        }
      }
    );
  }

}
