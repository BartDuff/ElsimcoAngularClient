import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.css']
})
export class EmailDialogComponent implements OnInit {
  form: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<EmailDialogComponent>) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  envoyer(){
    this.dialogRef.close(this.form.value);
  }

  fermer(){
    this.dialogRef.close();
  }
}
