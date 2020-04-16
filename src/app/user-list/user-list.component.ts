import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {MissionModel} from '../models/mission.model';
import {MissionService} from '../services/mission.service';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {MatDialog, MatDialogConfig, MatPaginator, PageEvent} from '@angular/material';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit {
  users: UserModel[];
  loading=true;
  pagedUsers: UserModel[];
  currentUser: UserModel;
  selectedUser: UserModel;
  length: number = 0;
  pageSize: number = 10;
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;

  constructor(private userService: UserService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getUsers();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngAfterViewInit(){
    this.paginatorTop._intl.itemsPerPageLabel = 'Utilisateurs par page : ';
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

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
        this.loading=false;
        this.length = this.users.length;
      },
          ()=>{},
      ()=>{
        this.pagedUsers = this.users.slice(0,this.pageSize);
      }
    );
  }

  OnPageChange(event: PageEvent, paginator){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if(endIndex > this.length){
      endIndex = this.length;
    }
    this.pagedUsers = this.users.slice(startIndex, endIndex);
    paginator.pageIndex = event.pageIndex;
  }

  selectUser(userSelected: UserModel) {
    this.selectedUser = userSelected;
  }

  deleteUser(userToDelete: UserModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.userService.deleteUser(userToDelete).subscribe(
            () => {
              this.users.splice(this.users.indexOf(userToDelete), 1);
            }
          );
        }
      });
  }
}
