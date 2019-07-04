import {Component, Input, OnInit} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  @Input() newsitem: NewsModel;

  constructor(private newsService: NewsService,
              private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      }
    );
    this.authService.emitCurrentUserSubject();
    this.newsService.emitNewsSubject();
  }

}
