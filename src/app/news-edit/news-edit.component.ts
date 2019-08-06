import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';
import {NewsService} from '../services/news.service';
import {UserModel} from '../models/user.model';

@Component({
  selector: 'app-news-edit',
  templateUrl: './news-edit.component.html',
  styleUrls: ['./news-edit.component.css']
})
export class NewsEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private newsService: NewsService) { }

  editForm: FormGroup;
  currentUser: UserModel;
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.editForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
    });
    this.route.params.subscribe(
      params => this.newsService.getSingleNews(params['id']).subscribe(
        data => {
          this.editForm.controls.id.setValue(data.id);
          this.editForm.controls.contenu.setValue(data.contenu);
          this.editForm.controls.titre.setValue(data.titre);
        }
      )
    );
  }

  onSubmit() {
    this.editForm.value.auteur = this.currentUser;
    this.newsService.editNews(this.editForm.value)
      .subscribe( data => {
        this.router.navigate(['news']);
      });
  }

}
