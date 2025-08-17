import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudPosComponent } from './Pages/cloud-pos/cloud-pos.component';

import { ProjectRoutingModule } from './project-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { CloudposReportComponent } from './Pages/Cloud-pos-Report/cloudpos-report/cloudpos-report.component';


// import other dependencies and components here

@NgModule({
  declarations: [
    // your components here
    CloudPosComponent,
  CloudposReportComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    FormsModule,
    SweetAlert2Module,
    ReactiveFormsModule,

],
})
export class ProjectModule {}