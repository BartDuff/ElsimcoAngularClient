import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-comment-fiche-dialog',
  templateUrl: './comment-fiche-dialog.component.html',
  styleUrls: ['./comment-fiche-dialog.component.css']
})
export class CommentFicheDialogComponent implements OnInit {
  form: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<CommentFicheDialogComponent>) { }

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
