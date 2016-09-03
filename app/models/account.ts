import { Member } from './member';

export class Account {
    members: Member[];
    accountname: string;
    emailaddress: string;
    paid: boolean;
    fees: number = 0;
    tooltip: string = null;
};
