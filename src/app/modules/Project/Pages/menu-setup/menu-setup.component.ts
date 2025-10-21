import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BillingSoftwareService } from '../../Services/billing-software.service';
import { CloudposReportService } from '../../Services/cloudpos-report.service';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { SorolSoftService } from '../../Services/sorol-soft.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  NavCreateForm!: FormGroup;
  isEditMode: boolean = false;
  parentMenuList: any[] = [];
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  constructor(
    private billingSoftwareService: BillingSoftwareService,
    private cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private cloudPosReportService: CloudposReportService,
    private readonly cloudPosService: CloudPosService,
    private readonly sorolSoftwareServie: SorolSoftService,
    private readonly _modalService: NgbModal
  ) {}

  ngOnInit() {
    this.initNavCreateForm();
    this.getNavListCloudPos();
    this.getNavListCloudePosReport();
    this.getNavListSorol();
    this.getNavListBilling();
    this.loadParentMenus();
    this.setupIsParentListener();
  }

  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      SERIAL: [null, Validators.required],
      PARENT_ID: [null],
      IsParent: [false],
      DESCRIPTION: ['', Validators.required],
      URL: ['', Validators.required],
      PER_ROLE: ['', Validators.required],
      ENTRY_BY: ['', Validators.required],
      ORDER_BY: [null, Validators.required],
      FA_CLASS: [''],
      MENU_TYPE: ['', Validators.required],
      SHOW_EDIT_PERMISSION: [false],
    });
  }
  createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
    debugger;
    if (data?.serial != null) {
      this.isEditMode = true;
      this.NavCreateForm.patchValue({
        SERIAL: data.serial,
        PARENT_ID: data.parenT_ID ?? null,
        DESCRIPTION: data.description || '',
        URL: data.url || '',
        PER_ROLE: data.peR_ROLE || '',
        ENTRY_BY: data.entrY_BY || '',
        ENTRY_DATE: data.entrY_DATE ? new Date(data.ENTRY_DATE) : new Date(),
        ORDER_BY: data.ordeR_BY || 0,
        FA_CLASS: data.fA_CLASS || '',
        ID: data.id || 0,
        MENU_TYPE: data.menU_TYPE || '',
        SHOW_EDIT_PERMISSION: data.shoW_EDIT_PERMISSION ?? false,
      });
    } else {
      this.NavCreateForm.reset({
        SERIAL: 0,
        PARENT_ID: 0,
        DESCRIPTION: '',
        URL: '',
        PER_ROLE: '',
        ENTRY_BY: 'POSADMIN',
        ENTRY_DATE: new Date(),
        ORDER_BY: 0,
        FA_CLASS: '',
        ID: 0,
        MENU_TYPE: '',
        SHOW_EDIT_PERMISSION: false,
      });
      this.NavCreateForm.get('SERIAL')?.valueChanges.subscribe((val) => {
        if (!this.isEditMode) {
          this.NavCreateForm.patchValue(
            { ORDER_BY: val || 0 },
            { emitEvent: false }
          );
        }
      });
    }

    const modalRef = this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result
      .then(
        (result) => {},
        (reason) => {}
      )
      .finally(() => {
        this.isEditMode = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
      });
  }
  setupIsParentListener() {
    this.NavCreateForm.get('IsParent')?.valueChanges.subscribe((isParent) => {
      if (isParent) {
        // Reset PARENT_ID when IsParent is checked
        this.NavCreateForm.patchValue({
          PARENT_ID: 0,
        });
      }
    });
  }
  loadParentMenus(): void {
    this.cloudPosService.GetParentNavCloudPosDBKMART().subscribe({
      next: (res) => {
        this.parentMenuList = res;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
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
    this.sorolSoftwareServie.getAllNavMediaSoft().subscribe({
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
  onSubmit(): void {
    debugger;
    if (this.NavCreateForm.invalid) {
      this.NavCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;
    const formData = new FormData();

    formData.append('SERIAL', this.NavCreateForm.get('SERIAL')?.value);
    formData.append(
      'PARENT_ID',
      this.NavCreateForm.get('PARENT_ID')?.value ?? ''
    );
    formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
    formData.append(
      'DESCRIPTION',
      this.NavCreateForm.get('DESCRIPTION')?.value
    );
    formData.append('URL', this.NavCreateForm.get('URL')?.value ?? '');
    formData.append('PER_ROLE', this.NavCreateForm.get('PER_ROLE')?.value);
    formData.append('ENTRY_BY', this.NavCreateForm.get('ENTRY_BY')?.value);
    formData.append('ORDER_BY', this.NavCreateForm.get('ORDER_BY')?.value);
    formData.append(
      'FA_CLASS',
      this.NavCreateForm.get('FA_CLASS')?.value ?? ''
    );
    formData.append(
      'MENU_TYPE',
      this.NavCreateForm.get('MENU_TYPE')?.value ?? ''
    );
    formData.append(
      'SHOW_EDIT_PERMISSION',
      this.NavCreateForm.get('SHOW_EDIT_PERMISSION')?.value
    );

    const request = isEdit
      ? this.cloudPosService.updateNav(formData)
      : this.cloudPosService.createNav(formData);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';

          this.getNavListCloudPos();
          this.loadParentMenus();
        } else {
          this.swalOptions.title = 'Error';
          this.swalOptions.text = res?.message ?? 'Something went wrong.';
          this.swalOptions.icon = 'error';
        }

        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
        this.isEditMode = false;
      },
      error: (error) => {
        this.swalOptions.title = 'Error';
        this.swalOptions.text =
          error?.error?.message || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
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
    this.cloudPosService.getAllNavMediaSoft().subscribe({
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

  // Track active tab
  onTabChange(tabId: string): void {
    debugger;
    this.activeTab = tabId;
  }

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
