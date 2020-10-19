export class AfterworkModel {
  lieu: String;
  date: Date;
  // heure: String;
  // minutes: String;
  budget: number;
  commentaire: boolean;

  public constructor(lieu,date,heure,minutes,budget,commentaire){
    this.lieu = lieu;
    this.date = date;
    // this.heure = heure;
    // this.minutes = minutes;
    this.budget = budget;
    this.commentaire = commentaire;
  }
}
