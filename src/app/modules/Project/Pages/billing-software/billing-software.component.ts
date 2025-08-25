import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BillingSoftwareService } from '../../Services/billing-software.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-billing-software',
  standalone: false,
  templateUrl: './billing-software.component.html',
  styleUrl: './billing-software.component.scss',
})
export class BillingSoftwareComponent implements OnInit {
  selectedTab: string = 'nav';
  isEditMode: boolean = false;
  navList: any[] = [];
  NavCreateForm!: FormGroup;
  spin: boolean;
  isOpenAction: number | null = null;
  parentMenuList: any[] = [];
  isSubmitting: boolean;
   addedRoles: any[] = [];
swalOptions: SweetAlertOptions = {};
  @ViewChild('noticeSwal')
  public readonly noticeSwal!: SwalComponent;
  constructor(
    private readonly billingSoftwareServie: BillingSoftwareService,
    private readonly cdr: ChangeDetectorRef,
    private readonly _modalService: NgbModal,
    private readonly fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.initNavCreateForm();
    this.getNavList();
    this.loadParentMenus();
    this.getRole();
  }
 
  getNavList() {
    this.billingSoftwareServie.getAllNav().subscribe({
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

  private initNavCreateForm(): void {
    this.NavCreateForm = this.fb.group({
      menuId: [null, Validators.required],
      parentMenuId: [null],
      IsParent: [false],
      menuName: ['', Validators.required],
      url: [
        '#',
        [Validators.required, Validators.pattern('^(https?:\\/\\/|#).+')],
      ],
      sorting: [null, Validators.required],
      applicationId: [null, Validators.required],
      creatorId: ['', Validators.required],     
      isActive: [true],
    });
  }
 createOrEditRoleModal(createOrUpdateModal: any, data?: any){

 }
updateRoles(){}
  createOrEditModalPopUp(createOrUpdateModal: any, data?: any) {
    debugger;
    if (data?.menuId != null) {
      this.isEditMode = true;
      this.NavCreateForm.patchValue({
        menuId: data.menuId,
        parentMenuId: data.parentMenuId ?? null,
        menuName: data.menuName || '',
        url: data.url || '',
        sorting: data.sorting || '',
        applicationId: data.applicationId || '',
        creatorId: data.creatorId ,

        isActive: data.isActive ?? false,
      });
    } else {
      this.NavCreateForm.reset({
        menuId: 0,
        parentMenuId: 0,
        menuName: '',
        url: '',               
        createDate: new Date(),
        sorting: 0,
        creatorId: '',
        applicationId: 0,
        isActive: true,
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

  getRole() {
    this.billingSoftwareServie.getRole().subscribe({
      next: (data: any) => {
        this.addedRoles = data;
        console.log('Navigation list loaded:', this.navList);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load navigation list', err);
      },
    });
  }
    loadParentMenus(): void {
    this.billingSoftwareServie.GetParentNav().subscribe({
      next: (res) => {
        this.parentMenuList = res;
      },
      error: (err) => {
        console.error('Error fetching parent menus:', err);
      },
    });
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
  UpdateNav() {
    debugger;
    const checkedMenus = this.navList
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
    this.billingSoftwareServie.updateCheckedNavItems(checkedMenus).subscribe({
      next: (res) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = 'Success!';
          this.swalOptions.text =
            res?.data ?? 'Navigation updated successfully.';
          this.swalOptions.icon = 'success';

          this.getNavList();
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


  onSubmit(): void {
    debugger;
    if (this.NavCreateForm.invalid) {
      this.NavCreateForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const isEdit = this.isEditMode;
    const formData = new FormData();

    formData.append('MenuId', this.NavCreateForm.get('menuId')?.value);
    formData.append(
      'ParentMenuId',
      this.NavCreateForm.get('parentMenuId')?.value ?? ''
    );
    formData.append('IsParent', this.NavCreateForm.get('IsParent')?.value);
    formData.append(
      'MenuName',
      this.NavCreateForm.get('menuName')?.value
    );
    formData.append('URL', this.NavCreateForm.get('url')?.value ?? '');
    formData.append('Sorting', this.NavCreateForm.get('sorting')?.value);
    formData.append('ApplicationId', this.NavCreateForm.get('applicationId')?.value);
 
    formData.append(
      'CreatorId',
      this.NavCreateForm.get('creatorId')?.value ?? ''
    );
   
    formData.append(
      'IsActive',
      this.NavCreateForm.get('isActive')?.value
    );

    const request = isEdit
      ? this.billingSoftwareServie.updateNav(formData)
      : this.billingSoftwareServie.createNav(formData);

    request.subscribe({
      next: (res: any) => {
        const isSuccess = res?.success === true ;

        if (isSuccess) {
          this.swalOptions.title = isEdit ? 'Updated!' : 'Created!';
          this.swalOptions.text =
            res?.Messages?.[0] ??
            (isEdit ? 'Navigation updated.' : 'Navigation created.');
          this.swalOptions.icon = 'success';

          this.getNavList();
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
