import { Component, OnInit } from '@angular/core';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {MatDialog} from '@angular/material';
import {NewsService} from '../services/news.service';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.css']
})
export class NewsListComponent implements OnInit {
  news: NewsModel[];
  currentUser: UserModel;
  constructor(private newsService: NewsService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.getNews();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  getNews() {
    this.newsService.getNews().subscribe(
      (data) => this.news = data
    );
  }
}
