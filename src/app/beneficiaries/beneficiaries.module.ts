import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BeneficiariesRoutingModule } from './beneficiaries-routing.module';
import { BeneficiariesComponent } from './beneficiaries.component';
import { PolicyTableComponent } from './components/policy-table/policy-table.component';
import { MedicalAssistanceTableComponent } from './components/medical-assistance-table/medical-assistance-table.component';


@NgModule({
  declarations: [
    BeneficiariesComponent,
    PolicyTableComponent,
    MedicalAssistanceTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BeneficiariesRoutingModule,
  ]
})
export class BeneficiariesModule { }
