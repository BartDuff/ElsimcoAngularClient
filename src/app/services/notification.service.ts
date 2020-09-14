import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  payload = {
    "app_key": "UdPJY6NdrDf4zIliMGVu",
    "redirect_uri": "http://localhost:4200/"
  }



  constructor(private http: HttpClient) { }

  // addPushSubscriber(sub:any): any{
  //   return this.http.post('/api/notifications', sub);
  // }

  addPushSubscriber(): Observable<any>{
    return this.http.get('https://api.pushed.co/1/oauth/index?client_id=UdPJY6NdrDf4zIliMGVu&redirect_uri=http://localhost:4200');
  }
}
