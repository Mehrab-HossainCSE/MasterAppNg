import { RouterModule, Routes } from "@angular/router";
import { CloudPosComponent } from "./Pages/cloud-pos/cloud-pos.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {
    path: 'cloud-pos',
    component: CloudPosComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}