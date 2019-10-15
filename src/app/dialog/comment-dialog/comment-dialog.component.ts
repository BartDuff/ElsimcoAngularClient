import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.css']
})
export class CommentDialogComponent implements OnInit {
  form: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<CommentDialogComponent>) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      commentaire: ['', Validators.required]
    });
  }

  envoyer(){
    this.dialogRef.close(this.form.value);
  }

  fermer(){
    this.dialogRef.close();
  }

}

