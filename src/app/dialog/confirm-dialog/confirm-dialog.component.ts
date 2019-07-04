import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  confirmed: boolean;
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) { }

  ngOnInit() {
  }

  confirmer() {
    this.confirmed = true;
    this.dialogRef.close(this.confirmed);
  }

  fermer() {
    this.confirmed = false;
    this.dialogRef.close(this.confirmed);
  }

}
