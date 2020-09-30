import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {MatDialog, MatDialogConfig, MatPaginator, MatPaginatorIntl, PageEvent} from '@angular/material';
import {NewsService} from '../services/news.service';
import {MissionModel} from '../models/mission.model';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})

export class NewsListComponent implements OnInit, AfterViewInit {
  news: NewsModel[];
  pagedNews: NewsModel[];
  currentUser: UserModel;
  loading = true;
  length: number = 0;
  pageSize: number = 5;
  @ViewChild('top') paginatorTop: MatPaginator;
  @ViewChild('bottom') paginatorBottom: MatPaginator;


  constructor(private newsService: NewsService,
              private userService: UserService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getNews();
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

  getNews() {
    this.newsService.getNews().subscribe(
      (data) => {
        this.news = data.filter((a)=>!a.public);
        // this.news = data;
        this.loading=false;
        this.length = this.news.length;
      },
      ()=>{},
      ()=>{
        this.pagedNews = this.news.slice(0,this.pageSize);
      }
    );
  }

  OnPageChange(event: PageEvent, paginator){
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if(endIndex > this.length){
      endIndex = this.length;
    }
    this.pagedNews = this.news.slice(startIndex, endIndex);
    paginator.pageIndex = event.pageIndex;
  }

  addNewsToList(addedNews: NewsModel) {
    this.newsService.addNewsInterestToUser(JSON.parse(localStorage.getItem('currentUser')), addedNews).subscribe(
      () => {

      }
    );
  }

  deleteNewsFromList(deletedNews: NewsModel) {
    this.newsService.removeNewsInterestFromUser(JSON.parse(localStorage.getItem('currentUser')), deletedNews).subscribe(
      () => {
      }
    );
  }

  deleteNews(newsToDelete) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      (data) => {
        if (data) {
          this.newsService.deleteSingleNews(newsToDelete).subscribe(
            () => {
              this.pagedNews.splice(this.news.indexOf(newsToDelete), 1);
            }
          );
        }
      }
    );
  }
}
