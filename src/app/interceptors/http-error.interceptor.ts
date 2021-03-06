import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { AlertInterface } from '../interfaces/alert/alert.interface';
import { RedirectionInterface } from '../interfaces/utilities/redirection.interface';
import {LOCAL_STORAGE_ID} from "../constants/rooms.constant";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(@Inject('AlertInterface') private  alertInt: AlertInterface,
              @Inject('RedirectionInterface') private  redirect: RedirectionInterface) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
    .pipe(tap(() => {},
        (err: any) => {
          this.alertInt.setAlertStatus(true, err.error);
          if (err.status === 403) {
            localStorage.removeItem(LOCAL_STORAGE_ID);
            this.redirect.redirectTo('/');
          }
          return throwError(err);
        })
    );
  }
}
