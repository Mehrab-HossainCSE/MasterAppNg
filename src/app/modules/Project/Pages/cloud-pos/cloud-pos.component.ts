import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CloudPosService } from '../../Services/cloud-pos.service';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { AlertTypeService } from 'src/app/shared/services/alert-type.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cloud-pos',
  standalone: false,

  templateUrl: './cloud-pos.component.html',
  styleUrl: './cloud-pos.component.scss',
})
export class CloudPosComponent implements OnInit {
  selectedTab: string = 'nav';
  spin: boolean;
  navList: any[] = [];
  NavCreateForm!: FormGroup;
  swalOptions: SweetAlertOptions = {};
  isEditMode: boolean = false;
  parentMenuList: any[] = [];
   isOpenAction: number | null = null;
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  isSubmitting: boolean;

  constructor(
    private readonly cloudPosService: CloudPosService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly _alertType: AlertTypeService,
    private readonly _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.selectedTab = 'nav';
    this.initNavCreateForm();
    this.loadParentMenus();
    this.getCompanyInfo();
    this.getNavList();
  }
  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      SERIAL: [null, Validators.required],
      PARENT_ID: [null],
      IsParent: [false],
      DESCRIPTION: ['', Validators.required],
      URL: [''],
      PER_ROLE: ['', Validators.required],
      ENTRY_BY: ['', Validators.required],

      ORDER_BY: [null, Validators.required],
      FA_CLASS: [''],
      MENU_TYPE: [''],
      SHOW_EDIT_PERMISSION: [false],
    });
  }

  getCompanyInfo() {
    this.spin = true;

    this.cloudPosService.getCompanyInfo().subscribe({
      next: (data: any) => {
        this.navList = data;
        console.log('Projects loaded:', this.navList);
        this.spin = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load projects', err);
        this.spin = false;
      },
    });
  }

  loadParentMenus(): void {
    this.cloudPosService.GetParentNavCloudPosDBKMART().subscribe({
      next: (res) => {
        this.parentMenuList = res; // populate dropdown list
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
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
        ENTRY_BY: '',
        ENTRY_DATE: new Date(),
        ORDER_BY: 0,
        FA_CLASS: '',
        ID: 0,
        MENU_TYPE: '',
        SHOW_EDIT_PERMISSION: false,
      });
    }

   const modalRef =  this._modalService.open(createOrUpdateModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static', 
      keyboard: false
    });

     modalRef.result
      .then(
        result => {
          // Called when modal is closed (e.g., modal.close('submit'))
          console.log('Closed with:', result);
        },
        reason => {
          // Called when modal is dismissed (e.g., modal.dismiss('cancel' or ESC or backdrop click))
          console.log('Dismissed with:', reason);
        }
      )
      .finally(() => {
        // This runs in both cases: close or dismiss
        this.isEditMode = false;
        this.NavCreateForm.reset({
          IsParent: false,
          SHOW_EDIT_PERMISSION: false,
        });
      });
  

  }

toggleParentCheckbox(menu: any) {
  console.log('Toggling parent checkbox for menu:', menu);
    menu.isChecked = !menu.isChecked;
debugger
    if (menu.children) {
      menu.children.forEach((child: any) => {
        child.isChecked = menu.isChecked;
      });
    }
    this.cdr.detectChanges();
  }

 toggleChildCheckbox(child: any, parent: any) {
  debugger;

  // Toggle the checkbox value
  child.isChecked = !child.isChecked;

  if (!Array.isArray(parent.children)) {
    console.error('parent.Children is not an array:', parent.Children);
    return;
  }

  // Check if all children are checked
  const allChildrenChecked = parent.children.every(
    (c: { isChecked: any }) => c.isChecked
  );

  // Check if no children are checked
  const noChildrenChecked = parent.children.every(
    (c: { isChecked: any }) => !c.isChecked
  );

  // Set parent checkbox based on children status
  if (allChildrenChecked) {
    parent.isChecked = true;
  } else if (noChildrenChecked) {
    parent.isChecked = false;
  } else {
    // Some children checked, some not
    parent.isChecked = true; // adjust as needed
  }

  this.cdr.detectChanges();
}


UpdateNav() {
  // Get only checked parent and children menus
  const checkedMenus = this.navList
    .map(parent => {
      // Filter checked children
      const checkedChildren = (parent.children || []).filter((children: { isChecked: any; }) => children.isChecked);

      // Include this parent only if:
      // - parent is checked
      // - OR at least one child is checked
      if (parent.isChecked || checkedChildren.length > 0) {
        return {
          ...parent,
          children: checkedChildren
        };
      }

      // If nothing is checked, return null (to be filtered out later)
      return null;
    })
    .filter(item => item !== null);

  console.log('Checked Menu:', checkedMenus);
  this.cloudPosService.updateCheckedNavItems(checkedMenus).subscribe({
        next: response => {
          console.log('Navigation updated successfully:', response);
        },
        error: err => {
          console.error('Failed to update nav:', err);
        }
      });
  // TODO: Send checkedMenus to your backend via HTTP request
  // this.http.post('/api/update-nav', checkedMenus).subscribe(...)
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
        const isSuccess = res?.success === true || res?.Succeeded === true;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';
          //this.getParentMenus(); // reload dropdown if needed
          this.getNavList(); // reload main table
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
        this.swalOptions.text =  error?.error?.message  || 'Server error occurred. Please try again.';
        this.swalOptions.icon = 'error';
        this.showAlert(this.swalOptions);
        this.isSubmitting = false;
      },
    });
  }

  getNavList() {
    this.cloudPosService.getAllNav().subscribe({
      next: (data: any) => {
        this.navList = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
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
