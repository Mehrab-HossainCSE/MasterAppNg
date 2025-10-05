import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudPosComponent } from './Pages/cloud-pos/cloud-pos.component';

import { ProjectRoutingModule } from './project-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { CloudposReportComponent } from './Pages/Cloud-pos-Report/cloudpos-report/cloudpos-report.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterAppComponent } from './Pages/master-app/master-app.component';
import { BillingSoftwareComponent } from './Pages/billing-software/billing-software.component';
import { VATProComponent } from './Pages/vat-pro/vat-pro.component';
import { SorolSoftComponent } from './Pages/sorol-soft/sorol-soft.component';
import { MenuSetupComponent } from './Pages/menu-setup/menu-setup.component';
import { UserCreateComponent } from './Pages/user-create/user-create.component';
import { RoleCreateClientComponent } from './Pages/role-create-client/role-create-client.component';


// import other dependencies and components here

@NgModule({
  declarations: [
    // your components here
    CloudPosComponent,
  CloudposReportComponent,
  MasterAppComponent,
  BillingSoftwareComponent,
  VATProComponent,
  SorolSoftComponent,
  MenuSetupComponent,
UserCreateComponent,
RoleCreateClientComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    FormsModule,
    SweetAlert2Module,
    ReactiveFormsModule,
    NgSelectModule ,

],
})
export class ProjectModule {}