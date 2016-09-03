export class Member {
  constructor(
    public _id: string = null,
    public firstname: string = null,
    public familyname: string = null,
    public dob: string = null,
    public address: string = null,
    public place: string = null,
    public postcode: string = null,
    public emailaddress: string = null,
    public primaryphone: string = null,
    public alternativephone: string = null,
    public liabilityagreed = false,
    public communicationsagreed = false,
    public photoagreed = false,
    public password: string = null,
    public confirmpassword: string = null,
    public student = false,
    public renewed: boolean = null,
    public paid: boolean = null,
    public familyemailaddress: string = null,
    public joiningyear: number = null,
    public exec: string = null
  ) { }
}