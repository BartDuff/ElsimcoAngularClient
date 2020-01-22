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
import {NgxGalleryAnimation, NgxGalleryArrowsComponent, NgxGalleryImage, NgxGalleryImageSize, NgxGalleryOptions} from 'ngx-gallery';

@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})
export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
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
    // this.sourceImg = this.newsitem.imageJointe == '' || this.newsitem.imageJointe == null?'': this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64, '+ this.newsitem.imageJointe);
    this.authService.emitCurrentUserSubject();
    this.newsService.emitNewsSubject();
    this.getLikes();
    this.galleryOptions = [
      {
        width: '100%',
        height: '50vh',
        thumbnailsColumns: 4,
        imageSize: NgxGalleryImageSize.Contain,
        imageAnimation: NgxGalleryAnimation.Slide,
        imagePercent: 100,
        thumbnailsPercent: 10,
        thumbnailsMargin: 10,
        thumbnailMargin: 10,
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '200px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 10,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        thumbnailsColumns: 4,
      },
      // max-width 400
      {
        breakpoint: 200,
        preview: true,
        width: '100%',
        height: '200px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 10,
        thumbnailsMargin: 20,
        thumbnailMargin: 20.,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      }
    ];

    this.galleryImages = [];
    for(let img of this.newsitem.images){
      let item =       {
        small: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
        medium: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
        big: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe
      };
      this.galleryImages.push(item);
    }
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
