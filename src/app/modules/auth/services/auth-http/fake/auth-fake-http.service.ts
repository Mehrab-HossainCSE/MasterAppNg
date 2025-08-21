import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserModel } from '../../../models/user.model';
import { AuthModel } from '../../../models/auth.model';
import { UsersTable } from '../../../../../_fake/users.table';
import { environment } from '../../../../../../environments/environment';

//import { LoginResponse } from '../../../models/auth.model';
const API_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  windowObj: any = window;
private readonly baseUrl = this.windowObj.__env.apiUrl;
  constructor(private http: HttpClient) {}

  // public methods
  login(UserName: string, password: string): Observable<any> {
    
    return this.http.post<AuthModel>(
      `${this.baseUrl}ProjectList/Authenticate`,
      { UserName, Password: password }
    );
    
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(this.baseUrl, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/forgot-password`, {
      email,
    });
  }

  getUserByToken(token: string): Observable<UserModel> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<UserModel>(`${this.baseUrl}/me`, {
      headers: httpHeaders,
    });
  }
}
