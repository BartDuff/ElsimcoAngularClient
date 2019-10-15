import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  confirmed: boolean;
  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
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
