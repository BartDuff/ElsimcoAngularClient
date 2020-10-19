import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {NotificationModel} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ForumTabService {
  previousTab : Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }
}
