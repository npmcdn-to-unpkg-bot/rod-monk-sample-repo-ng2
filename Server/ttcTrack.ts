/// <reference path="../typings/globals/node/index.d.ts" />

const BugzScout = require('bugzscout');
require('dotenv').config();

const bugzscout_InfoOnly = new BugzScout({
    user: process.env.FOGBUGZ_USER,
    project: "ttcServer",
    area: "InfoOnly",
    domain: process.env.FOGBUGZ_DOMAIN,
    email: "",
    forceNewBug: false
});

const bugzscout_Warning = new BugzScout({
    user: process.env.FOGBUGZ_USER,
    project: "ttcServer",
    area: "Warning",
    domain: process.env.FOGBUGZ_DOMAIN,
    email: "",
    forceNewBug: true
});

const bugzscout_Alarm = new BugzScout({
    user: process.env.FOGBUGZ_USER,
    project: "ttcServer",
    area: "Alarm",
    domain: process.env.FOGBUGZ_DOMAIN,
    email: "",
    forceNewBug: true
});

exports.InfoOnly = (description: string, extra: any = null) => {
    bugzscout_InfoOnly.submit({ description: description, extra: extra, defaultMessage: 'BugzScout InfoOnly' },
        (err: Error, res: any) => {
            if (err) {
                console.log('BugzScout InfoOnly Error: ' + err);
            }
        });
};

exports.Warning = (description: string, extra: any = null) => {
    bugzscout_Warning.submit({ description: description, extra: extra, defaultMessage: 'BugzScout Warning' },
        (err: Error, res: any) => {
            if (err) {
                console.log('BugzScout Warning Error: ' + err);
            }
        });
};

exports.Alarm = (description: string, extra: any = null) => {
    bugzscout_Alarm.submit({ description: description, extra: extra, defaultMessage: 'BugzScout Alarm' },
        (err: Error, res: any) => {
            if (err) {
                console.log('BugzScout Alarm Error: ' + err);
            }
        });
};
