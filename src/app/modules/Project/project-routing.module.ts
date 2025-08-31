import { RouterModule, Routes } from "@angular/router";
import { CloudPosComponent } from "./Pages/cloud-pos/cloud-pos.component";
import { NgModule } from "@angular/core";
import { AuthGuard } from "../auth/services/auth.guard";
import { CloudposReportComponent } from "./Pages/Cloud-pos-Report/cloudpos-report/cloudpos-report.component";
import { MasterAppComponent } from "./Pages/master-app/master-app.component";
import { BillingSoftwareComponent } from "./Pages/billing-software/billing-software.component";
import { VATProComponent } from "./Pages/vat-pro/vat-pro.component";
import { SorolSoftComponent } from "./Pages/sorol-soft/sorol-soft.component";

const routes: Routes = [
  {
    path: 'cloud-pos',canActivate: [AuthGuard],
    component: CloudPosComponent,
  },
    {
    path: 'cloudpos-report',canActivate: [AuthGuard],
    component: CloudposReportComponent,
  },
   {
    path: 'master-app',canActivate: [AuthGuard],
    component: MasterAppComponent,
  },
   {
    path: 'billing-soft',canActivate: [AuthGuard],
    component: BillingSoftwareComponent,
  },
  {
    path: 'vatPro-soft',canActivate: [AuthGuard],
    component: VATProComponent,
  },
   {
    path: 'sorol-soft',canActivate: [AuthGuard],
    component: SorolSoftComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}