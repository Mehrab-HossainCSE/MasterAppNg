import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BillingSoftwareService } from '../../Services/billing-software.service';
import { CloudposReportService } from '../../Services/cloudpos-report.service';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { SorolSoftService } from '../../Services/sorol-soft.service';
@Component({
  selector: 'app-menu-setup',

  templateUrl: './menu-setup.component.html',
  styleUrl: './menu-setup.component.scss',
})
export class MenuSetupComponent implements OnInit {
  activeTab: string = 'cloudpos';
  isSubmitting: boolean = false;
  navListBilling: any[] = [];
  navListCloudPos: any[] = [];
  navListCloudPosMis: any[] = [];
  navListVatPro: any[] = [];
  navListSorolSoft: any[] = [];
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  constructor(
    private billingSoftwareService: BillingSoftwareService,
    private cdr: ChangeDetectorRef,
    private cloudPosReportService: CloudposReportService,
    private readonly cloudPosService: CloudPosService,
    private readonly sorolSoftwareServie: SorolSoftService,
  ) {}

  ngOnInit() {
    this.getNavListCloudPos();
    this.getNavListCloudePosReport();
    this.getNavListSorol();
    this.getNavListBilling();
  }
  // Parent checkbox toggle
  toggleParentCheckbox(parent: any): void {
    debugger;
    parent.isChecked = !parent.isChecked;

    // Update all children to match parent
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        child.isChecked = parent.isChecked;
      });
    }
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
   getNavListSorol() {
    this.sorolSoftwareServie.getAllNav().subscribe({
      next: (data: any) => {
        this.navListSorolSoft = data;
        console.log('Navigation list loaded:', this.navListSorolSoft);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }

  // Child checkbox toggle
  toggleChildCheckbox(child: any, parent: any): void {
    debugger;
    child.isChecked = !child.isChecked;

    if (parent.children && parent.children.length > 0) {
      const allChecked = parent.children.every((c: any) => c.isChecked);
      const someChecked = parent.children.some((c: any) => c.isChecked);

      parent.isChecked = someChecked;
      parent.indeterminate = someChecked && !allChecked;
    }
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

  // Simple selection toggle (for flat lists)
  toggleSelection(id: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    // Find and update in current active tab's list
    let currentList: any[] = [];

    switch (this.activeTab) {
      case 'vatpro':
        currentList = this.navListVatPro;
        break;
      case 'sorolsoft':
        currentList = this.navListSorolSoft;
        break;
      case 'billing':
        currentList = this.navListBilling;
        break;
    }

    // Update the item
    const updateItem = (items: any[]) => {
      items.forEach((item) => {
        if (item.id === id) {
          item.isChecked = isChecked;
        }
        if (item.children) {
          updateItem(item.children);
        }
      });
    };

    updateItem(currentList);
  }

  // Check if item is selected
  isChecked(id: number): boolean {
    let currentList: any[] = [];

    switch (this.activeTab) {
      case 'vatpro':
        currentList = this.navListVatPro;
        break;
      case 'sorolsoft':
        currentList = this.navListSorolSoft;
        break;
      case 'billing':
        currentList = this.navListBilling;
        break;
    }

    const findChecked = (items: any[]): boolean => {
      for (const item of items) {
        if (item.id === id) return item.isChecked || false;
        if (item.children) {
          const found = findChecked(item.children);
          if (found) return true;
        }
      }
      return false;
    };

    return findChecked(currentList);
  }
 
  // Save CloudPos navigation
  saveCloudPosNav(): void {
    this.isSubmitting = true;

    const checkedMenus = this.navListCloudPos
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    this.cloudPosService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;
        debugger;
        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

          //this.getNavList();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }
        this.isSubmitting = false;
        this.showAlert(this.swalOptions);
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.isSubmitting = false;
        this.showAlert(this.swalOptions);
      },
    });
  }

  // Save CloudPos MIS navigation
  saveCloudPosMisNav(): void {
    this.isSubmitting = true;
     const checkedMenus = this.navListCloudPosMis
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    console.log('Checked Menu:', checkedMenus);
    this.cloudPosReportService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

        
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }
       this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       

        
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       
      },
    });
    
  }

  // Save VatPro navigation
  saveVatProNav(): void {
    this.isSubmitting = true;
   
  }

  // Save SorolSoft navigation
  saveSorolSoftNav(): void {
    this.isSubmitting = true;
   const checkedMenus = this.navListSorolSoft
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    console.log('Checked Menu:', checkedMenus);
    this.sorolSoftwareServie.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

          
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }
         this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       

     
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
         this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       
      },
    });
  }

  // Save Billing navigation
  saveBillingNav(): void {
    this.isSubmitting = true;
    const checkedMenus = this.navListBilling
      .map((parent) => {
        const checkedChildren = (parent.children || []).filter(
          (children: { isChecked: any }) => children.isChecked
        );

        if (parent.isChecked || checkedChildren.length > 0) {
          return {
            ...parent,
            children: checkedChildren,
          };
        }

        return null;
      })
      .filter((item) => item !== null);

    console.log('Checked Menu:', checkedMenus);
    this.billingSoftwareService.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

         
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }
        this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       

       
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
         this.isSubmitting = false;
        this.showAlert(this.swalOptions);
       
      },
    });
  }

  // Track active tab
  onTabChange(tabId: string): void {
    debugger;
    this.activeTab = tabId;
  }

  // Get count of selected items
  // getSelectedCount(navList: any[]): number {
  //   return this.getSelectedNavIds(navList).length;
  // }
  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    } else if (swalOptions.icon === 'warning') {
      style = 'warning';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }
}
