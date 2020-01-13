import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
import {MissionModel} from '../models/mission.model';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  sourceImg;
  isLiked: boolean;
  likes : UserModel[];
  likesForNews:UserModel[];
  @Input() newsitem: NewsModel;
  @Output() newsSelected = new EventEmitter<NewsModel>();
  @Output() newsToDeleteInList = new EventEmitter<NewsModel>();

  constructor(private newsService: NewsService,
              private userService: UserService,
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
    this.getLikes();
  }

  getLikes() {
    this.newsService.getLikesForNews(this.newsitem).subscribe(
      (data)  => {
        this.likes = data;
        this.isLiked = this.likes.find(x => x.id === this.currentUser.id) !== undefined;
      }
    )
  }

  addNewsToList() {
    this.newsSelected.emit(this.newsitem);
    this.getLikes();
  }

  deleteNewsFromList() {
    this.newsToDeleteInList.emit(this.newsitem);
    this.getLikes();
  }

  getPrenoms(list: UserModel[]): String{
    let pList = "";
    if(list != undefined){
      for(let l of list){
        pList += l.prenom + ", ";
      }
      pList = pList.substr(0,pList.length-2);
    }
    return pList;
  }

}
