import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';

const API_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class NewsService {

  newsSubject = new Subject<any[]>();

  private news = [];

  emitNewsSubject() {
    this.newsSubject.next(this.news.slice());
  }

  constructor(private http: HttpClient) { }

  getNews(): Observable<NewsModel[]> {
    return this.http.get<NewsModel[]>(`${API_URL}/news`, { withCredentials : true});
  }

  addNews(newNewsitem: any): Observable<any> {
    return this.http.post(`${API_URL}/news/`, newNewsitem);
  }

  editNews(updatedNews: NewsModel): Observable<NewsModel> {
    return this.http.put<NewsModel>(`${API_URL}/news/${updatedNews.id}`, updatedNews);
  }

  getSingleNews(idRecherche: string): Observable<NewsModel> {
    return this.http.get<NewsModel>(`${API_URL}/news/${idRecherche}`);
  }

  deleteSingleNews(newsitem: NewsModel): Observable<any> {
    const idASupprimer = newsitem.id;
    return this.http.delete(`${API_URL}/news/${idASupprimer}`);
  }

  getLikesForNews(news: NewsModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.get(`${API_URL}/news/${news.id}/likes`, { headers: headers});
  }

  addNewsInterestToUser(user: UserModel, news: NewsModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.post(`${API_URL}/news/${news.id}/likes`, user, { headers: headers});
  }

  removeNewsInterestFromUser(user: UserModel, news: NewsModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type'  : 'application/json'});
    return this.http.delete(`${API_URL}/news/${news.id}/likes/${user.id}`, { headers: headers});
  }

}
