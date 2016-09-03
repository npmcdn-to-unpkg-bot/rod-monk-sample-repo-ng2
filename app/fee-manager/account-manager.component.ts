import { Member }               from '../models/member';
import { Renewal }              from '../models/renewal';
import { Account }              from '../models/account';
import { LogService }           from '../services/log.service';
import * as moment from 'moment';
import * as _ from 'lodash';

export class AccountManagerComponent {

    private listOfLists: Array<Array<Member>> = [];
    protected accounts: Array<Account> = [];
    public accountingYear: number = moment().year();
    protected logService: LogService;

    constructor() { }

    protected findMemberInSubLists = (emailaddress: string): number =>
        // Search to see if an emailaddress is known to a subList
        this.listOfLists.findIndex(subList => subList.some(member => member.emailaddress === emailaddress));


    protected addMemberToSublist = (subList: Array<Member>, member: Member) => {

        if (_.isUndefined(subList)) {
            throw new Error('addMemberToSublist: subList not defined');
        }

        // Ensure that the member has not already been added to the sublist
        if (subList.every(m => m._id != member._id)) {
            subList.push(member);
        }
    }

    // How many have we accumulated in the subLists?
    private countTotalInSublists = () =>
        this.listOfLists.reduce((previous, current) => previous += current.length, 0);

    private createSubLists = (members: Member[]) => {

        // Start with a clean sheet
        this.listOfLists = [];

        // Place members into their subList
        members.forEach((member, outer_index) => {

            // Ensure that every member document has a 'paid' field
            member.paid = _.isUndefined(member.paid) ? false : member.paid;

            // Students get special treatment - give them their own sublist
            if (member.student) {
                this.listOfLists.push(new Array<Member>(member));
            } else {

                // Search to see if the member's familyemailaddress has already been allocated to a list
                let subListIndex = this.findMemberInSubLists(member.familyemailaddress);

                // If so, the member should be added to that sublist if not already there
                if (subListIndex >= 0) {
                    this.addMemberToSublist(this.listOfLists[subListIndex], member);
                } else {

                    // Next check by emailaddress
                    if (this.findMemberInSubLists(member.emailaddress) < 0) {
                        // Need a new subList
                        subListIndex = this.listOfLists.push(new Array<Member>(member)) - 1;
                    }

                    // Include all those members using the same emailaddress or familyemailaddress
                    for (let j = outer_index + 1; j < members.length; ++j) {
                        if (members[outer_index].emailaddress === members[j].emailaddress ||
                            (members[outer_index].familyemailaddress && member.familyemailaddress ===
                                members[j].emailaddress) ||
                            (members[j].familyemailaddress && (members[outer_index].emailaddress ===
                                members[j].familyemailaddress))) {
                            this.addMemberToSublist(this.listOfLists[subListIndex], members[j]);
                        }
                    }
                }
            }
        });
    }

    private createAccounts = () =>

        _.orderBy(this.listOfLists.map(subList => {

            let account = new Account();

            // The name of the oldest person becomes the name of the account
            let oldest = subList.reduce((previous, current) => current.dob < previous.dob ? current : previous);
            account.accountname = _.capitalize(oldest.familyname + ', ' + oldest.firstname);
            account.emailaddress = oldest.emailaddress;

            // If everyone in the account is paid, then the account is paid
            account.paid = subList.every(member => member.paid);

            account.fees = this.calculateFees(subList);

            // Create the tooltip for the account
            account.tooltip = subList.reduce((previous: string, member: Member) =>
                previous += member.firstname + ' ' + member.familyname + ', DoB: ' + member.dob + ' | ', null);

            account.members = subList; // Capture the entire sublist for debugging purposes
            return account;
        }), 'accountname', 'asc');


    private calculateFees = (subList: Array<Member>) => {

        let fees = 0;
        let adults = 0;
        let juniors = 0;
        let execs = 0;      // Execs get a discount
        let lifetimes = 0;  // Lifers pay no fees

        // Start of season begins on April 1
        let startOfSeason = moment(this.accountingYear + '-04-01');

        subList.forEach(member => {

            // Students get special handling
            if (member.student) {
                fees = 105.00;
            }
            else {

                // Younger than 18 is a junior
                let dob = moment(member.dob, 'YYYY-MM-DD');
                let diff = startOfSeason.diff(dob, 'years');
                if (diff < 18) {
                    ++juniors;
                } else {
                    ++adults;
                }

                if (Boolean(member.exec) && member.exec !== 'lifetime') {
                    ++execs;
                }

                if (Boolean(member.exec) && member.exec === 'lifetime') {
                    ++lifetimes;
                }

                const SinglesFee = 246.75;
                const CouplesFee = 388.50;

                if (adults === 1) {
                    if (juniors === 0) {
                        fees = SinglesFee;
                    } else if (juniors === 1) {
                        fees = 300.00;
                    } else if (juniors >= 2) {
                        fees = 350.00;
                    }
                } else if (adults === 2) {
                    if (juniors === 0) {
                        fees = CouplesFee;
                    } else {
                        fees = 450.00;
                    }
                } else if (adults === 3) { // A junior will be 18 on April 1st
                    fees = 450.00;
                } else {
                    let erroMessage: string = 'adults, juniors, execs: ' + adults + ', ' + juniors + ', ' + execs;
                    this.logService.logMessage(erroMessage);
                    fees = -1; // We have a problem if here.
                }

                if (adults === 1 && lifetimes === 1) {
                    fees = 0;
                } else if (adults === 2 && lifetimes === 1) {
                    fees = SinglesFee;
                }

                for (let exec_i = 0; exec_i < execs; ++exec_i) {
                    fees -= SinglesFee / 2.0;
                }
            }
        });
        // Only deal with even dollars
        return Math.round(fees);
    }

    protected generateAccounts = (members) => {

        try {
            // Each subList forms a fee paying account
            this.createSubLists(members);
            this.accounts = this.createAccounts();

            /*
            console.log('Total Members: ', members.length);
            console.log('Total sublists: ', this.listOfLists.length);
            console.log('Total count in sub lists: ', this.countTotalInSublists());
            console.log('Total Accounts: ', this.accounts.length);
            */

        } catch (err) {
            throw err;
        }
    }

}