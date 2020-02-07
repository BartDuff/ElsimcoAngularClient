import { Component, OnInit } from '@angular/core';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {NewsService} from '../services/news.service';
import {MissionModel} from '../models/mission.model';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})

export class NewsListComponent implements OnInit {
  news: NewsModel[];
  currentUser: UserModel;
  loading = true;
  constructor(private newsService: NewsService,
              private userService: UserService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.getNews();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getNews() {
    this.newsService.getNews().subscribe(
      (data) => {
        this.news = data.filter((a)=>!a.public);
        this.loading=false;
      }
    );
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
              this.news.splice(this.news.indexOf(newsToDelete), 1);
            }
          );
        }
      }
    );
  }
}
