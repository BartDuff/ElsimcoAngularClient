import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NewsService} from '../services/news.service';
import {NewsModel} from '../models/news.model';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-news-add',
  templateUrl: './news-add.component.html',
  styleUrls: ['./news-add.component.css']
})
export class NewsAddComponent implements OnInit {
  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private newsService: NewsService) { }

  addForm: FormGroup;
  currentUser: UserModel;
  get f() {
    return this.addForm.value;
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.addForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
    });

  }

  onSubmit() {
    let newsitem:NewsModel = this.f;
    newsitem.auteur = this.currentUser;
    this.newsService.addNews(newsitem)
      .subscribe( () => {
        this.router.navigate(['news']);
      });
  }
}
