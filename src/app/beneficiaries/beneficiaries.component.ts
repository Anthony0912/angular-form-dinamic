import { Component, OnInit } from '@angular/core';
import {
  PARENTAGE_POLICY,
  PARENTAGE_MEDICAL_ASSISTANCE,
  PERCENTAGE_ALLOCATION
} from 'src/app/beneficiaries/constants/table.contant';

import Parentage from 'src/app/beneficiaries/interfaces/parentage.interface';
import Beneficiary from './interfaces/beneficiary.interface';
import { PercentageAllocation } from './interfaces/percentage-allocation.interface';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.css']
})
export class BeneficiariesComponent implements OnInit {

  public quantityInParentagePolicy: { id: number; quantity: number }[] = [];
  public quantityInParentageMediacalAssitance: { id: number; quantity: number }[] = [];

  private _parentagePolicy: Parentage[] = PARENTAGE_POLICY;
  private _parentageMedicalAssitance: Parentage[] = PARENTAGE_MEDICAL_ASSISTANCE;
  private _percentageAllocation: typeof PERCENTAGE_ALLOCATION = PERCENTAGE_ALLOCATION;
  private _beneficiariesPolicy: Beneficiary[] = [];
  private _beneficiariesMediacalAssitance: Beneficiary[] = [];

  constructor() { }

  ngOnInit(): void { }

  public getBeneficiariesPolicy(beneficiaries: Beneficiary[]): void {
    this._beneficiariesPolicy = beneficiaries;
    this._quantityInParentagePolicy();
  }

  public getBeneficiariesMediacalAssitance(beneficiaries: Beneficiary[]): void {
    this._beneficiariesMediacalAssitance = beneficiaries;
    this._quantityInParentageMediacalAssitance();
  }

  private _quantityInParentagePolicy(): void {
    this.quantityInParentagePolicy = [{ id: 1, quantity: 0 }, { id: 2, quantity: 0 }];
    this._beneficiariesPolicy.map(beneficiary => {
      const parentage: number = Number(beneficiary.parentage);
      if (parentage === this._parentagePolicy[0].id) {
        this.quantityInParentagePolicy[0].quantity += 1;
      } else if (parentage === this._parentagePolicy[1].id) {
        this.quantityInParentagePolicy[1].quantity += 1;
      }
    });
  }

  private _quantityInParentageMediacalAssitance(): void {
    this.quantityInParentageMediacalAssitance = [{ id: 1, quantity: 0 }, { id: 2, quantity: 0 }];
    this._beneficiariesMediacalAssitance.map(beneficiary => {
      const parentage: number = Number(beneficiary.parentage);
      if (parentage === this._parentagePolicy[0].id) {
        this.quantityInParentagePolicy[0].quantity += 1;
      } else if (parentage === this._parentagePolicy[1].id) {
        this.quantityInParentagePolicy[1].quantity += 1;
      }
    });
  }

  public get parentagePolicy(): Parentage[] {
    return [...this._parentagePolicy];
  }

  public get parentageMedicalAssitance(): Parentage[] {
    return [...this._parentageMedicalAssitance];
  }

  public get percentageAllocation(): PercentageAllocation[] {
    return [...this._percentageAllocation];
  }

}
