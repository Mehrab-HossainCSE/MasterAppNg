import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { CrudModule } from '../modules/crud/crud.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectionInterceptor } from './services/change-ditection-interceptor';
import { ClickOutsideDirective } from './services/click.outside.directive';
import { KeeniconComponent } from './components/keenicon/keenicon.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EmptyComponent } from './components/empty/empty.component';

interface NgxSpinnerConfig {
  type?: string;
}

@NgModule({
  declarations: [
    ClickOutsideDirective,
    KeeniconComponent,
    EmptyComponent
    // ChangeDetectionInterceptor
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    CrudModule,
    NgSelectModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
  ],
  exports:[
    CrudModule,
    NgSelectModule,
    NgbModule,
    ClickOutsideDirective,
    KeeniconComponent,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    EmptyComponent
    // ChangeDetectionInterceptor
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
