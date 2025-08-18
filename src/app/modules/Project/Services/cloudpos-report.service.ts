import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { App, AppResponse } from '../Models/AppResponse';

@Injectable({
  providedIn: 'root'
})
export class CloudposReportService{
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;

 
  createProject(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/ProjectList/CreateProject`,
      project
    );
  }
  createNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/CreateCloudPosReportHerlanCheck`,
      project
    );
  }
    assignedUserMenus(UserDto: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/AssignUserMenu`,
      UserDto
    );
  }
assignMenu(Role_Name: string): Observable<any> {
  return this.httpClient.post(
    `${this.baseUrl}/CloudPosReportHerlanCheck/GetRoleWiseMenuCloudPosReportHerlanCheck`,
    JSON.stringify(Role_Name), // <-- make it valid JSON
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
  GetParentNavCloudPosDBKMART(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/GetParentNavCloudPosReportHerlanCheck`,
      {}
    );
  }
   getRoleCloudPosDBKMART(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/GetRoleCloudPosReportHerlanCheck`,
      {}
    );
  }
  updateNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/UpdateNavCloudPosReportHerlanCheck`,
      project
    );
  }
  updateProject(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/ProjectList/UpdateProject/`,
      project
    );
  }
  getAllNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/GetNavCloudPosDBKMART`,
      {}
    );
  }
   getAllUser(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/GetAllUser`,
      {}
    );
  }
  getAllPrivilege(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/GetAllRole`,
      {}
    );
  }
 getCompanyInfo(): Observable<App> {
  return this.httpClient
    .get<App>(`${this.baseUrl}/CloudPosDBKMART/getCompanyInfo`)
    .pipe(catchError(this.handleError));
}

  updateCheckedNavItems(checkedMenus: any[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosReportHerlanCheck/UpdateDatabaseNavCloudPosReportHerlanCheck`,
      checkedMenus
    );
  }
  deleteProject(Id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/ProjectList/DeleteProject/${Id}`);
  }
  getNavs() {
    return this.httpClient
      .get<any>(`${this.baseUrl}Navs/GetAll`, {})
      .pipe(map((response: any) => response));
  }

  updateNavs(data: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}navs/Update`, data); // Corrected baseUrl reference
  }
  addRole(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/CloudPosReportHerlanCheck/RoleCreateCloudPosReportHerlanCheck`, dto);

  }
  menuOnSubmit(dto: any): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/CloudPosReportHerlanCheck/UpdateMenuIdToTheRoleCloudPosReportHerlanCheck`, dto);
 
  }
  delete(MenuId: number): Observable<any> {
    return this.httpClient
      .delete<void>(this.baseUrl + 'navs/Delete?MenuId=' + MenuId)
      .pipe(map((response: any) => response));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error: ', errorResponse.error);
    } else {
      console.error('Server Side error', errorResponse);
    }
    return throwError('There is a problem with the service');
  }
}
