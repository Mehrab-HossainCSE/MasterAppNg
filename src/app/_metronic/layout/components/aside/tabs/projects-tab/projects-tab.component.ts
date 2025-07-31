import { Component, OnInit } from '@angular/core';

type Project = {
  image: string;
  title: string;
  link: string;
};

const projects: ReadonlyArray<Project> = [
  {
    image: './assets/media/svg/brand-logos/bebo.svg',
    title: 'cloud-pos',
    link: 'project/cloud-pos',
  },
  
];
@Component({
  selector: 'app-projects-tab',
  templateUrl: './projects-tab.component.html',
})
export class ProjectsTabComponent implements OnInit {
  allProjects: ReadonlyArray<Project> = [];
  constructor() {}

  ngOnInit(): void {
   this.allProjects = projects;
  }
}
