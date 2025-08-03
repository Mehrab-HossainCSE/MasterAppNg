import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { App, AppResponse } from '../Models/AppResponse';
import { environment } from 'src/environments/environment';
import { Project } from '../Models/Project';

@Injectable({
  providedIn: 'root',
})
export class CloudPosService {
  onCollegeCreated: Subject<any> = new Subject<any>();

  constructor(private readonly httpClient: HttpClient) {}

  windowObj: any = window;
  private readonly baseUrl = environment.apiUrl;

  getProjects(): Observable<App[]> {
    return this.httpClient
      .get<AppResponse>(`${this.baseUrl}/ProjectList/getProject`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }
  createProject(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/ProjectList/CreateProject`,
      project
    );
  }
  createNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/CreateNavCloudPosDBKMART`,
      project
    );
  }
assignMenu(ID:any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/GetRoleWiseMenuCloudPosDBKMART`,
      ID
    );
  }
  GetParentNavCloudPosDBKMART(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/GetParentNavCloudPosDBKMART`,
      {}
    );
  }
   getRoleCloudPosDBKMART(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/GetRoleCloudPosDBKMART`,
      {}
    );
  }
  updateNav(project: any): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/UpdateNavCloudPosDBKMART`,
      project
    );
  }
  updateProject(project: any): Observable<any> {
    return this.httpClient.put(
      `${this.baseUrl}/ProjectList/UpdateProject/${project.Id}`,
      project
    );
  }
  getAllNav(): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/GetNavCloudPosDBKMART`,
      {}
    );
  }
  getCompanyInfo(): Observable<App[]> {
    return this.httpClient
      .get<AppResponse>(`${this.baseUrl}/GetCompanyInfo`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }
  updateCheckedNavItems(checkedMenus: any[]): Observable<any> {
    return this.httpClient.post(
      `${this.baseUrl}/CloudPosDBKMART/UpdateDatabaseNavCloudPosDBKMART`,
      checkedMenus
    );
  }
  deleteProject(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/DeleteProject/${id}`);
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
    return this.httpClient.post(`${this.baseUrl}/CloudPosDBKMART/RoleCreateCloudPosDBKMART`, dto);
 
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
