import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MissionService} from '../services/mission.service';
import {MissionModel} from '../models/mission.model';
import {NewsService} from '../services/news.service';

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

  ngOnInit() {

    this.editForm = this.formBuilder.group({
      id: [],
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
    });
    this.route.params.subscribe(
      params => this.newsService.getSingleNews(params['id']).subscribe(
        data => {
          this.editForm.controls.contenu.setValue(data.contenu);
          this.editForm.setValue(data);
        }
      )
    );
  }

  onSubmit() {
    this.newsService.editNews(this.editForm.value)
      .subscribe( data => {
        this.router.navigate(['news']);
      });
  }

}
