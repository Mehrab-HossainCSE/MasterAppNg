import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { WidgetsModule } from '../../_metronic/partials';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {
            path: '',
            component: DashboardComponent,
        },
    ]),
    WidgetsModule,
    ReactiveFormsModule, // ✅ ADD THIS
    FormsModule,
    SweetAlert2Module
],
})
export class DashboardModule {}
