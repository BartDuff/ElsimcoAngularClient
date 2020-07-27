import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-refuse-with-comment',
  templateUrl: './refuse-with-comment.component.html',
  styleUrls: ['./refuse-with-comment.component.css']
})
export class RefuseWithCommentComponent implements OnInit {

  form: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<RefuseWithCommentComponent>) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      commentaire: ['']
    });
  }

  envoyer(){
    this.dialogRef.close(this.form.value);
  }

  fermer(){
    this.dialogRef.close();
  }

}
