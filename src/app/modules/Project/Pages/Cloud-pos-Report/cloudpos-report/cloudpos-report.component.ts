import { Component } from '@angular/core';

@Component({
  selector: 'app-cloudpos-report',
  standalone: false,

  templateUrl: './cloudpos-report.component.html',
  styleUrl: './cloudpos-report.component.scss'
})
export class CloudposReportComponent {
  selectedTab: string = 'nav';
}
