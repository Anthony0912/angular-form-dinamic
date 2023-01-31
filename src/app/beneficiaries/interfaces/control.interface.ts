import { AbstractControl } from '@angular/forms';
export default interface FormCustomControl{
  parentage            : AbstractControl;
  identification       : AbstractControl;
  completeName         : AbstractControl;
  percentageAllocation?: AbstractControl;
  birthday             : AbstractControl;
  medicalBenefit?      : AbstractControl;
}
