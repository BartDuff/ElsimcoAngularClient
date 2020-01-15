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
    this.sourceImg = this.newsitem.imageJointe == '' || this.newsitem.imageJointe == null?'': this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64, '+ this.newsitem.imageJointe);
    this.authService.emitCurrentUserSubject();
    this.newsService.emitNewsSubject();
    this.getLikes();
    this.galleryOptions = [
      {
        width: '100%',
        height: '50vh',
        thumbnailsColumns: 4,
        imageSize: NgxGalleryImageSize.Contain,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '200px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
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
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20.,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      }
    ];

    this.galleryImages = [
      {
        small: 'data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64,'+ this.newsitem.imageJointe,
        medium: 'data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64,'+ this.newsitem.imageJointe,
        big: 'data:image/' + this.newsitem.imageJointeType.toLowerCase() + ';base64,'+ this.newsitem.imageJointe
      },
      {
        small: `/../../${environment.base}/assets/images/resume.jpg`,
        medium: `/../../${environment.base}/assets/images/resume.jpg`,
        big: `/../../${environment.base}/assets/images/resume.jpg`
      },
      {
        small: `/../../${environment.base}/assets/images/resume2.png`,
        medium: `/../../${environment.base}/assets/images/resume2.png`,
        big: `/../../${environment.base}/assets/images/resume2.png`
      }
    ];
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
