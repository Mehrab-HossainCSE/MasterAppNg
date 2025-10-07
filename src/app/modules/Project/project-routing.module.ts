import { RouterModule, Routes } from "@angular/router";
import { CloudPosComponent } from "./Pages/cloud-pos/cloud-pos.component";
import { NgModule } from "@angular/core";
import { AuthGuard } from "../auth/services/auth.guard";
import { CloudposReportComponent } from "./Pages/Cloud-pos-Report/cloudpos-report/cloudpos-report.component";
import { MasterAppComponent } from "./Pages/master-app/master-app.component";
import { BillingSoftwareComponent } from "./Pages/billing-software/billing-software.component";
import { VATProComponent } from "./Pages/vat-pro/vat-pro.component";
import { SorolSoftComponent } from "./Pages/sorol-soft/sorol-soft.component";
import { MenuSetupComponent } from "./Pages/menu-setup/menu-setup.component";
import { UserCreateComponent } from "./Pages/user-create/user-create.component";
import { RoleCreateClientComponent } from "./Pages/role-create-client/role-create-client.component";
import { UserCreateClientComponent } from "./Pages/user-create-client/user-create-client.component";

const routes: Routes = [
  {
    path: 'cloud-pos',canActivate: [AuthGuard],
    component: CloudPosComponent,
  },
    {
    path: 'cloudpos-report',canActivate: [AuthGuard],
    component: CloudposReportComponent,
  },
  //  {
  //   path: 'UserCreate',canActivate: [AuthGuard],
  //   component: MasterAppComponent,
  // },
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
  {
    path: 'menusetup',canActivate: [AuthGuard],
    component: MenuSetupComponent,
  },
 
  {
    path: 'usercreate',canActivate: [AuthGuard],
    component: UserCreateComponent,
  },
   {
    path: 'RoleCreate',canActivate: [AuthGuard],
    component: RoleCreateClientComponent,
  },
    {
    path: 'UserCreate',canActivate: [AuthGuard],
    component: UserCreateClientComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}