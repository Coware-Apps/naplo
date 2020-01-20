import { Component, OnInit, Input } from '@angular/core';
import { Lesson } from 'src/app/_models';
import { ConfigService, KretaService } from 'src/app/_services';
import { DateHelper } from 'src/app/_helpers';

@Component({
  selector: 'app-orarendi-ora',
  templateUrl: './orarendi-ora.component.html',
  styleUrls: ['./orarendi-ora.component.scss'],
})
export class OrarendiOraComponent implements OnInit {

  @Input() public lesson: Lesson;
  @Input() public showDate: boolean;

  public datum: Date;

  constructor(
    public config: ConfigService,
    public kreta: KretaService,
    private dateHelper: DateHelper,
  ) { }

  ngOnInit() {
    this.datum = new Date(this.lesson.KezdeteUtc);
  }

  public getLessonCssClasses() {
    return {
      naplozott: this.lesson.Allapot.Nev == 'Naplozott',
      nemnaplozott: this.lesson.Allapot.Nev == 'Nem_naplozott',
      jovobeni: this.dateHelper.isInFuture(this.lesson.KezdeteUtc),
      elmaradt: this.lesson.IsElmaradt,
      helyettesitett: this.lesson.HelyettesitoId && this.lesson.HelyettesitoId != this.kreta.currentUser["kreta:institute_user_id"],
    };
  }

  public getMonogram(nev: string) {
    return nev.replace(/[a-zà-ú\- ]/g, '');
  }

}
