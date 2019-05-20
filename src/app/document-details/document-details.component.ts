import {Component, Input, OnInit} from '@angular/core';
import {UserModel} from '../models/user.model';
import {UserService} from '../services/user.service';
import {ActivatedRoute} from '@angular/router';
import {DocumentModel} from '../models/document.model';
import {DocumentService} from '../services/document.service';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css']
})
export class DocumentDetailsComponent implements OnInit {

  @Input() document: DocumentModel;

  constructor(private documentService: DocumentService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => this.documentService.getDocument(params['id']).subscribe(
        data => this.document = data
      )
    );
  }
}
