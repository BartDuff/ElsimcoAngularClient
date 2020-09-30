import {Component, OnInit} from '@angular/core';
import {UserModel} from './models/user.model';
import {SwPush, SwUpdate} from '@angular/service-worker';
import {NotificationService} from './services/notification.service';
import {PushNotificationsService} from 'ng-push';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ElsimcoAngularClient';
  currentUser: UserModel;
  readonly VAPID_PUBLIC_KEY = "BJ19TG6FbyDjN1SL27QUm399oqso60BNoSXNsdCEZu7DVhV--meVslq0fy_1bB6qcTKhhc-KHop2L2lLnh9FF8s";

  constructor(
    private swPush: SwPush,
    private _pushNotifications: PushNotificationsService,
    private notificationService: NotificationService,
    private swUpdate: SwUpdate,
    private http:HttpClient) {
    // this._pushNotifications.requestPermission();
    // this.subscribeToNotifications();

  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Nouvelle version disponible. Charger la nouvelle version?")) {
          window.location.reload(true);
        }
      });
    }
  }

  // subscribeToNotifications() {
  //   this.swPush.requestSubscription({
  //     serverPublicKey: this.VAPID_PUBLIC_KEY
  //   })
  //     .then(sub => this.notificationService.addPushSubscriber(sub).subscribe())
  //     .catch(err => console.error("Could not subscribe to notifications", err));
  // }

  // request(){
  //   this.notificationService.addPushSubscriber().subscribe(
  //     (data)=>{
  //       console.log(data);
  //     }
  //   );
  // }

  // notify(){ //our function to be called on click
  //   let options = { //set options
  //     body: "The truth is, I'am Iron Man!",
  //     icon: "assets/images/elsimco-black.PNG", //adding an icon
  //     vibrate: [20,50,100]
  //   }
  //   this._pushNotifications.create('Iron Man', options).subscribe( //creates a notification
  //     res => console.log(res),
  //     err => console.log(err)
  //   );
  // }

}
