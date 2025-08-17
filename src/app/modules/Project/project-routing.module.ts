import { RouterModule, Routes } from "@angular/router";
import { CloudPosComponent } from "./Pages/cloud-pos/cloud-pos.component";
import { NgModule } from "@angular/core";
import { AuthGuard } from "../auth/services/auth.guard";
import { CloudposReportComponent } from "./Pages/Cloud-pos-Report/cloudpos-report/cloudpos-report.component";

const routes: Routes = [
  {
    path: 'cloud-pos',canActivate: [AuthGuard],
    component: CloudPosComponent,
  },
    {
    path: 'cloudpos-report',canActivate: [AuthGuard],
    component: CloudposReportComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}