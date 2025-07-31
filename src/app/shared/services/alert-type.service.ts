import { Injectable } from '@angular/core';
import { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertTypeService {

constructor() { }

errorAlert: SweetAlertOptions = {
  icon: 'error',
  title: 'Error!',
  text: 'Something went wrong!',
};
createSuccessAlert: SweetAlertOptions = {
  icon: 'success',
  title: 'Success!',
};
allreadyCompletedAlert: SweetAlertOptions = {
  icon: 'warning',
  title: 'Allready Completed!',
};
allreadyAssignAlert: SweetAlertOptions = {
  icon: 'warning',
  title: 'Allready Assigned!',
};
userNameAlreadyExistsAlertOptions: SweetAlertOptions = {
  icon: 'warning',
  title: 'User Name already exists',
};
branchIDAlreadyExistsAlertOptions: SweetAlertOptions = {
  icon: 'warning',
  title: 'Branch Id already exists Give unique one',
};
updateSuccessAlert: SweetAlertOptions = {
  icon: 'success',
  title: 'Success!',
};
deleteSuccessAlert: SweetAlertOptions = {
  icon: 'success',
  title: 'Success!',
};
notEidt: SweetAlertOptions = {
  icon: 'warning',
  title: 'Edit Not possible',
};
notEidtAlert: SweetAlertOptions = {
  icon: 'warning',
  title: 'Order are delevery to factory',
};

setAlertTypeText(text: string){
  this.createSuccessAlert.text = text+' created successfully!';
  this.updateSuccessAlert.text = text+' updated successfully!';
  this.deleteSuccessAlert.text = text+' deleted successfully!';
}

}
