import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DocumentModel} from '../models/document.model';
import {UserModel} from '../models/user.model';
import {ImageModel} from '../models/image.model';
import {environment} from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  imageSubject = new Subject<any[]>();

  private images = [];

  emitImageSubject() {
    this.imageSubject.next(this.images.slice());
  }

  constructor(private http: HttpClient) { }

  getImages(): Observable<ImageModel[]> {
    return this.http.get<ImageModel[]>(`${API_URL}/images`, { withCredentials : true});
  }

  uploadImage(image: ImageModel):Observable<any> {
    return this.http.post(`${API_URL}/images`, image);
  }

  uploadJustif(image: ImageModel):Observable<any> {
    return this.http.post(`${API_URL}/images/justif`, image);
  }

  editImage(updatedImage: ImageModel): Observable<ImageModel> {
    return this.http.put<ImageModel>(`${API_URL}/images/${updatedImage.id}`, updatedImage);
  }

  getImage(idRecherche: number): Observable<ImageModel> {
    return this.http.get<ImageModel>(`${API_URL}/images/${idRecherche}`);
  }

  deleteImage(image: ImageModel): Observable<any> {
    const idASupprimer = image.id;
    return this.http.delete(`${API_URL}/images/${idASupprimer}`);
  }

}
