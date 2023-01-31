export default interface Beneficiary {
  parentage             : string;
  identification?       : string;
  completeName          : string;
  percentageAllocation? : string;
  birthday              : Date;
  medicalBenefit?       : boolean;
}
