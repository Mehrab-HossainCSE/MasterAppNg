import { Component, OnInit } from '@angular/core';

type Project = {
  logoUrl: string;
  title: string;
  navigateUrl: string;
};

// const projects: ReadonlyArray<Project> = [
//   {
//     logoUrl: './assets/media/svg/brand-logos/bebo.svg',
//     title: 'cloud-pos',
//     navigateUrl: 'project/cloud-pos',
//   },
//     {
//     logoUrl: './assets/media/svg/files/pdf.svg',

//     title: 'cloudpos-report',
//     navigateUrl: 'project/cloudpos-report',
//   },
  
// ];
@Component({
  selector: 'app-projects-tab',
  templateUrl: './projects-tab.component.html',
})
export class ProjectsTabComponent implements OnInit {
  allProjects: ReadonlyArray<Project> = [];
    windowObj: any = window;
   fileUrl = this.windowObj.__env.fileUrl;
  constructor() {}

  ngOnInit(): void {
   //this.allProjects = projects;
       const localProjects = this.loadProjects();
    if (localProjects.length > 0) {
      this.allProjects = localProjects;
    } 
  }
  loadProjects(): Project[] {
    const data = localStorage.getItem('sideNavs');
    return data ? JSON.parse(data) : [];
  }
}
