import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BillingSoftwareService } from '../../Services/billing-software.service';
import { CloudposReportService } from '../../Services/cloudpos-report.service';
import { CloudPosService } from '../../Services/cloud-pos.service';

@Component({
  selector: 'app-menu-setup',

  templateUrl: './menu-setup.component.html',
  styleUrl: './menu-setup.component.scss',
})
export class MenuSetupComponent implements OnInit {
  navListBilling: any[] = [];
  navListCloudPos: any[] = [];
  navListCloudPosMis: any[] = [];
  navListVatPro: any[] = [];
  navListSorolSoft: any[] = [];
  constructor(
    private billingSoftwareService: BillingSoftwareService,
    private cdr: ChangeDetectorRef,
    private cloudPosReportService: CloudposReportService,
    private readonly cloudPosService: CloudPosService,
  ) {}
  
  ngOnInit() {
    
    this.getNavListCloudPos();
    //this.getNavListCloudePosReport();
  }
 toggleParentCheckbox(menu: any) {
    console.log('Toggling parent checkbox for menu:', menu);
    menu.isChecked = !menu.isChecked;
    debugger;
    if (menu.children) {
      menu.children.forEach((child: any) => {
        child.isChecked = menu.isChecked;
      });
    }
    this.cdr.detectChanges();
  }

  toggleChildCheckbox(child: any, parent: any) {
    debugger;

    child.isChecked = !child.isChecked;

    if (!Array.isArray(parent.children)) {
      console.error('parent.Children is not an array:', parent.Children);
      return;
    }

    const allChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => c.isChecked
    );

    const noChildrenChecked = parent.children.every(
      (c: { isChecked: any }) => !c.isChecked
    );

    if (allChildrenChecked) {
      parent.isChecked = true;
    } else if (noChildrenChecked) {
      parent.isChecked = false;
    } else {
      parent.isChecked = true;
    }

    this.cdr.detectChanges();
  }

  getNavListCloudPos() {
    debugger;
    this.cloudPosService.getAllNav().subscribe({
      next: (data: any) => {
        this.navListCloudPos = data;
        console.log('Navigation list loaded:', this.navListCloudPos);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  getNavListBilling() {
    this.billingSoftwareService.getAllNav().subscribe({
      next: (data: any) => {
        this.navListBilling = data;
        console.log('Navigation list loaded:', this.navListBilling);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
  getNavListCloudePosReport() {
    this.cloudPosReportService.getAllNav().subscribe({
      next: (data: any) => {
        this.navListCloudPosMis = data;
        console.log('Navigation list loaded:', this.navListCloudPosMis);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
    selectedNavs: number[] = [];
  toggleSelection(itemId: number, event: any) {
    if (event.target.checked) {
      this.selectedNavs.push(itemId);
    } else {
      this.selectedNavs = this.selectedNavs.filter(id => id !== itemId);
    }
    localStorage.setItem('selectedNavs', JSON.stringify(this.selectedNavs));
  }

  isChecked(itemId: number): boolean {
    return this.selectedNavs.includes(itemId);
  }


}
