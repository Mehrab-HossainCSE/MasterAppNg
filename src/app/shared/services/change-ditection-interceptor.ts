import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChangeDetectorRef, ApplicationRef } from '@angular/core';

@Injectable()
export class ChangeDetectionInterceptor implements HttpInterceptor {

  constructor(
    private appRef: ApplicationRef,
    private cdr: ChangeDetectorRef,

  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Trigger change detection
            //  this.cdr.detectChanges();
          this.appRef.tick();
        }
      })
    );
  }
}
