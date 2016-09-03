import { Member }                           from '../models/member';
import { NormalizationService }             from '../services/normalization.service';

export class BaseEditor {

    public member = new Member();
    private places = [
        'Tsawwassen, BC, Canada',
        'Delta, BC, Canada',
        'Richmond, BC, Canada',
        'Surrey, BC, Canada',
        'Vancouver, BC, Canada',
        'Point Roberts, WA, USA'];

    onBlurPostCode = () =>
        this.member.postcode = NormalizationService.postcode(this.member.postcode);

    onBlurDoB = () =>
        this.member.dob = NormalizationService.date(this.member.dob);

    onBlurPrimaryPhone = () =>
        // change phone number to canonical form
        this.member.primaryphone = NormalizationService.phoneNumber(this.member.primaryphone);

    onBlurAlternatePhone = () =>
        // change alternative phone number to canonical form
        this.member.alternativephone = NormalizationService.phoneNumber(this.member.alternativephone);
}
