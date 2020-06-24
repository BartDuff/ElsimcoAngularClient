import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NewsModel} from '../models/news.model';
import {Subscription} from 'rxjs';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {AuthenticationService} from '../services/authentication.service';
import {NewsService} from '../services/news.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NgxGalleryAnimation, NgxGalleryImageSize, NgxGalleryOptions} from 'ngx-gallery';
import {ImageService} from '../services/image.service';


@Component({
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.css']
})

export class NewsItemComponent implements OnInit {
  currentUserSubscription: Subscription;
  currentUser: UserModel;
  galleryOptions: NgxGalleryOptions[];
  singleImg;
//  galleryImages: NgxGalleryImage[];
  galleryImages: any[]=[];
  galleryImagesTmp;
  sourceImg;
  videoCode:SafeUrl;
  isLiked: boolean;
  likes : UserModel[];
  likesForNews:UserModel[];
  typeMatch ={
    'jpeg':'jpeg',
    'JPG':'jpeg',
    'JPEG':'jpeg',
    'jpg':'jpeg',
    'png':'png',
    'PNG':'png'
  };
  @Input() newsitem: NewsModel;
  @Output() newsSelected = new EventEmitter<NewsModel>();
  @Output() newsToDeleteInList = new EventEmitter<NewsModel>();
  @Output() newsToDelete = new EventEmitter<NewsModel>();

  constructor(private newsService: NewsService,
              private userService: UserService,
              private authService: AuthenticationService,
              private sanitizer: DomSanitizer,
              private imageService: ImageService) {
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
        height: '70vh',
        thumbnailsColumns: 4,
        imageSize: NgxGalleryImageSize.Contain,
        imageAnimation: NgxGalleryAnimation.Slide,
        imagePercent: 100,
        thumbnailsPercent: 20,
        thumbnailsMargin: 10,
        thumbnailMargin: 10,
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '300px',
        imageSize: NgxGalleryImageSize.Contain,
        imageSwipe: true,
        imagePercent: 100,
        thumbnailsPercent: 20,
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
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20.,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      }
    ];

    this.galleryImages = [];
    this.galleryImagesTmp = [];

    // for(let img of this.newsitem.images){
    //   let item =       {
    //     small: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
    //     medium: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe,
    //     big: 'data:image/' + img.imageJointeType.toLowerCase() + ';base64,'+ img.imageJointe
    //   };
    //   this.galleryImages.push(item);
    // }
    //

     if(this.newsitem.imageIds){
       for(let imgid of this.newsitem.imageIds.split(",")){
         this.imageService.getImage(+imgid).subscribe(
           (img)=>{
             this.singleImg = img;
             let item = {
               id:+imgid,
               small: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe,
               medium: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe,
               big: 'data:image/' + this.typeMatch[img.imageJointeType.toString()] + ';base64,'+ img.imageJointe
             };

             this.galleryImages.push(item);
             this.galleryImages.sort(
               (a,b)=>{
                 let aa=a.id;
                 let bb=b.id;
                 return aa<bb?1:(aa>bb?-1:0)
               }
             );
           }
         );
       }
     }
     if(this.newsitem.videoLink){
       this.videoCode = this.sanitizer.bypassSecurityTrustResourceUrl( "https://www.youtube.com/embed/"+ this.newsitem.videoLink.substr(this.newsitem.videoLink.indexOf('=')+1,this.newsitem.videoLink.length-this.newsitem.videoLink.indexOf('=')));
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
    this.isLiked = true;
    this.likes.push(this.currentUser);
    // this.getLikes();
  }

  deleteNewsFromList() {
    this.newsToDeleteInList.emit(this.newsitem);
    this.isLiked = false;
    this.likes.splice(this.likes.indexOf(this.currentUser),1);
    // this.getLikes();
  }

  deleteNews(){
      this.newsToDelete.emit(this.newsitem);
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

  createTextLinks_(text) {
    let pattern = /(\d{10})|(\+33\d{9})|(\+33\s\d{1}\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(0\s\d{3}\s\d{3}\s\d{3}\s)|(0\s\d{3}\s\d{2}\s\d{2}\s\d{2}\s)|(0\d{3}\s\d{3}\s\d{3}\s)|(0\d{3}\s\d{2}\s\d{2}\s\d{2}\s)/gi;
    return (text || "")
      .replace(
      /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
      function(match, space, url){
        let hyperlink = url;
        if (!hyperlink.match('^https?:\/\/')) {
          hyperlink = 'http://' + hyperlink;
        }
        return space + '<a class="links" href="' + hyperlink + '" target="_blank">' + url + '</a>';
      }
    )
      .replace(
      pattern,
      function(match2){
        return '<a class="showOnMobile links" href="tel:' + match2 + '">' + match2 + '</a>'+'<span class="hideOnMobile">'+match2+'</span>';
      }
    );
  };

  // regexp: /\d{10}|\+33\d{9}|\+33\s\d{1}\s\d{2}\s\d{2}\s\d{2}\s\d{2}|\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2}|0\s\d{3}\s\d{3}\s\d{3}\s|0\s\d{3}\s\d{2}\s\d{2}\s\d{2}\s|0\d{3}\s\d{3}\s\d{3}\s|0\d{3}\s\d{2}\s\d{2}\s\d{2}\s/g

}
