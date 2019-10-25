import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-allow-anticipation-dialog',
  templateUrl: './allow-anticipation-dialog.component.html',
  styleUrls: ['./allow-anticipation-dialog.component.css']
})
export class AllowAnticipationDialogComponent implements OnInit {

  confirmed: boolean;
  constructor(
    private dialogRef: MatDialogRef<AllowAnticipationDialogComponent>
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
