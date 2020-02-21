import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {ImageService} from '../services/image.service';
import { saveAs } from 'file-saver';
import {el} from '@angular/platform-browser/testing/src/browser_util';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  img;
  currentUser: UserModel;
  img_bgd = `../../${environment.base}/assets/images/179317.jpg`;
  spinner = true;
  @Input() user: UserModel;

  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private imageService: ImageService) { }

  ngOnInit() {
    this.spinner = true;
    this.route.params.subscribe(
      params => this.userService.getUser(params['id']).subscribe(
        data => {
          this.user = data;
          this.imageService.getImage(this.user.imageId).subscribe(
            (image) => {
              this.img = image == null? `/../../${environment.base}/assets/images/profile.png` : this.sanitizer.bypassSecurityTrustResourceUrl('data:image/' + image.imageJointeType + ';base64, '+ image.imageJointe);
              this.spinner = false;
            }
          );
        }
      )
    );
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

   formatTel(element) {
    let separator = " ";
    let newvalue = "";
    if(element != undefined){
      for (let i = 0; i < element.length; i++) {
        if ((i > 0) && (i % 2 == 0)) {
          newvalue += separator;
        }
        newvalue += element.charAt(i);
      }
      element = newvalue;
    }
    return element;
  }

  formatTelForCall(element){
    if(element != undefined) {
      element = element.slice(1);
      let phoneCall = element.trim();
      phoneCall = "+33" + phoneCall;
      return phoneCall;
    }
    return element;
  }

  downloadDocument(user){
    let isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent &&
      navigator.userAgent.indexOf('CriOS') == -1 &&
      navigator.userAgent.indexOf('FxiOS') == -1;
    // if (conge.documentJointUri) {
    //   // let blob = this.base64ToBlob(conge.documentJointUri, 'text/plain');
    //   // saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
    //   let blob = this.base64ToBlob(conge.documentJointUri, 'application/'+ conge.documentJointType);
    //   if(!navigator.userAgent.match('CriOS') || !isSafari) {
    //     saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
    //   } else {
    //     // let reader = new FileReader();
    //     // reader.onload = function(e){
    //     //   window.location.href = reader.result
    //     // };
    //     // reader.readAsDataURL(blob);
    //     window.open(URL.createObjectURL(blob));
    //   }
    // }
    if (user.competenceId) {
      // let blob = this.base64ToBlob(conge.documentJointUri, 'text/plain');
      // saveAs(blob, 'justif_'+conge.user.prenom + '_'+ conge.user.nom + "."+conge.documentJointType);
      this.imageService.getImage(user.competenceId).subscribe(
        (file)=>{
          let blob = this.base64ToBlob(file.imageJointe, 'application/'+ file.imageJointeType);
          if(!navigator.userAgent.match('CriOS') || !isSafari) {
            saveAs(blob, file.originalFilename);
          } else {
            // let reader = new FileReader();
            // reader.onload = function(e){
            //   window.location.href = reader.result
            // };
            // reader.readAsDataURL(blob);
            window.open(URL.createObjectURL(blob));
          }
        }
      );
    }
  }

  public base64ToBlob(b64Data, contentType='', sliceSize=512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
  }
}
