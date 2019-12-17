import {Component, Input, OnInit} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {MissionService} from '../services/mission.service';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  sourceImg;
  @Input() newsitem: NewsModel;

  constructor(private newsService: NewsService,
              private authService: AuthenticationService,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUserSubject.subscribe(
      (user) => {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      }
    );
    this.sourceImg = this.newsitem.imageJointe == '' || this.newsitem.imageJointe == null?'': this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64, '+ this.newsitem.imageJointe);
    this.authService.emitCurrentUserSubject();
    this.newsService.emitNewsSubject();
  }

}
