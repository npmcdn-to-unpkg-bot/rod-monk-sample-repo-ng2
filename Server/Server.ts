/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/lodash/index.d.ts" />
/// <reference path="../typings/globals/moment-node/index.d.ts" />

import * as _ from 'lodash';
import { NewsItem } from '../app/models/newsitem';
import { AuthenticationError, DuplicateMemberError, PaymentRequiredError } from './error.classes';

const ttcDB = require('./ttcDB');
const ttcGmail = require('./ttcGmail');
const Track = require('./ttcTrack');
const GridFS = require('./ttcGridFS');
const MailChimp = require('./ttcMailChimp');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');
const cache = require('memory-cache');
const HTTP_Unauthorized = 401;
const HTTP_PaymentRequired = 402;
const HTTP_PreconditionFailed = 412;
const HTTP_LoginTimeout = 440;
const HTTP_ServerError = 500;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Some Type Aliases
type NextErr = (err: any) => void;
type Callback = () => void;

/* ExpressJS Setup

    ... Session management using 'express-session'
    ... Role-Based Access Control using 'easy-rbac'
    ... Configuring express to handle static file delivery
    ... API endpoints

*/

const server = express();
const compression = require('compression');

// compress all requests
server.use(compression());

// Capturing server side messages on the Chrome console
server.use(require('express-chrome-logger'));

// Prepare to capture request body data
server.use(bodyParser.json());

// Define the application body parser
let jsonParser = bodyParser.json();

// Relax security with the following during development
server.use(function (req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Setup Session Management
const session = require('express-session');

// Extend the Session prototype with some custom functions
// Add a login function
session.Session.prototype.login = function login(
    memberId: string, firstname: string, familyname: string,
    exec: string, role: string, device: string) {
    // Set a time of login
    this.loggedInAt = Date.now() + 1;
    this.memberId = memberId;
    this.firstname = firstname;
    this.familyname = familyname;
    this.exec = exec || 'member';
    this.role = role;
    this.device = device;
};

session.Session.prototype.changeRole = function changeRole(role: string) {
    this.role = role;
}

// Add a function to check the logged in status of the user
session.Session.prototype.isLoggedIn = function isLoggedIn() {
    return !!this.loggedInAt;
};

// Add a function to check the freshness of the session
session.Session.prototype.isFresh = function isFresh() {
    return (this.loggedInAt && (Date.now() - this.loggedInAt) < process.env.SESSION_TIMEOUT_1_WEEK);
};

// Using connect-mongo to manage sessions
const MongoStore = require('connect-mongo')(session);
server.use(session({
    secret: 'this is a nice secret',
    resave: false,
    name: 'sessionID',
    saveUninitialized: true,
    cookie: { secure: false },
    store: new MongoStore({
        url: process.env.MONGO_DB,
        autoRemove: 'native'
    })
}));
server.use(cookieParser());

// Define where to get the static files
server.use(express.static(__dirname + '/..'));

// RBAC Setup (Role-Bases Access Control)
const RBAC = require('easy-rbac');
const member_roles = require('./member_roles');
const rbac = new RBAC(member_roles.role_definitions);

// Capture the user's device details whenever available
server.all('/api/*', (request: any, response: any, next: any) => {

    try {
        ttcDB.upsertDevice(
            jwt.decode(request.headers['x-auth'], process.env.SECRET_JWT_KEY)._id,
            request.headers['device'])
            .then()
            .catch();
    } catch (e) {
        // If either member id or device is not available, no need to complain
    }
    finally {
        next();
    }
});

// Count the total number of members
server.get('/api/members/count', (request: any, response: any, next: NextErr) => {
    ttcDB.countMembers()
        .then((memberCount: number) => response.json(memberCount))
        .catch(next);
});

// A member is signing up for the first time
server.post('/api/members/signup', jsonParser, (request: any, response: any, next: NextErr) =>
    ttcDB.signupMember(request.body)
        .then((member: { _id: string, firstname: string, familyname: string, exec: string, role: string }) => {
            request.session.login(
                member._id,
                member.firstname,
                member.familyname,
                member.exec,
                _.isUndefined(member.role) ? 'member' : member.role,
                request.headers['device']);
            response.json({
                jwt: jwt.encode({ _id: member._id }, process.env.SECRET_JWT_KEY),
                exec: member.exec, permissions: member_roles.getPermissions(request.session.role)
            });
        })
        .catch(next));

// A member is logging in
server.post('/api/members/login', jsonParser, (request: any, response: any, next: NextErr) =>
    ttcDB.loginMember(request.body)
        .then((member: { _id: string, firstname: string, familyname: string, exec: string, role: string }) => {
            request.session.login(
                member._id,
                member.firstname,
                member.familyname,
                member.exec,
                _.isUndefined(member.role) ? 'member' : member.role,
                request.headers['device']);
            response.json({
                jwt: jwt.encode({ _id: member._id }, process.env.SECRET_JWT_KEY),
                exec: member.exec, permissions: member_roles.getPermissions(request.session.role)
            });
        })
        .catch(next));

// Get all the trivia
server.get('/api/trivia', (request: any, response: any, next: NextErr) => {
    ttcDB.getTrivia()
        .then((trivia: any) => response.json(trivia))
        .catch(next)
});

// Get all the etiquette rules
server.get('/api/etiquette', (request: any, response: any, next: NextErr) => {
    ttcDB.getEtiquette()
        .then((etiquette: any) => response.json(etiquette))
        .catch(next)
});

// A member is logging out
server.post('/api/members/logout', (request: any, response: any) => {
    request.session.destroy();
    response.end();
});

// Get all News Items
server.get('/api/newsitems', (request: any, response: any, next: NextErr) =>
    ttcDB.getNewsItems()
        .then((newsItems: any[]) => response.json(newsItems))
        .catch(next));

server.get('/api/newsitems/count', (request: any, response: any, next: NextErr) =>
    ttcDB.getNewsItemsCount()
        .then((count: number) => response.json({ count: count }))
        .catch(next));

// Get all files associated with a News Item
server.get('/api/newsitems/:id/files', (request: any, response: any, next: any) =>

    GridFS.retrieveNewsItemFiles(request.params.id)
        .then((files: any[]) => response.json(files))
        .catch(next));

// Save a new member
server.post('/api/members', jsonParser, (request: any, response: any, next: NextErr) =>
    ttcDB.duplicateCheck(request.body)
        .then(ttcDB.saveNewApplicant)
        .then(MailChimp.addMember)
        .then(() => response.end())
        .catch(next));

// Get the executive for the Contact Us screen
server.get('/api/executive', (request: any, response: any, next: NextErr) =>

    ttcDB.getExecutive()
        .then((executive: any) => response.json(executive))
        .catch(next));

// An error log message being received from a client...capture all that we can
server.post('/api/log', jsonParser, (request: any, response: any, next: NextErr) => {
    ttcDB.logMessage({
        message: request.body.message,
        memberId: request.session.memberId,
        firstname: request.session.firstname,
        familyname: request.session.familyname,
        device: request.session.device
    })
        .then(() => response.end())
        .catch(next);
});

// Ensure that the session is not stale for all subsequent endpoints
server.use((request: any, response: any, next: any) => {

    if (!request.session.isFresh()) {
        request.session.destroy();
        response.sendStatus(HTTP_LoginTimeout).end();
    } else {
        next();
    }
});

// Ensure a valid JSON Web Token for all subsequent endpoints
server.use((request: any, response: any, next: any) => {

    let token = request.headers['x-auth'];
    if (!token) {
        response.sendStatus(HTTP_Unauthorized).end();
    } else {
        ttcDB.authorizeMember(jwt.decode(token, process.env.SECRET_JWT_KEY)._id)
            .then(() => next())
            .catch(() => response.sendStatus(HTTP_Unauthorized).end());
    }
});

// Delete a member record
server.delete('/api/members/:id', (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'members:delete')
        .then(() => ttcDB.deleteMember(request.params.id))
        .then(() => response.end())
        .catch(next));

// Delete a document
server.delete('/api/documents/:id', (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'documents:delete')
        .then(() => GridFS.removeFileFromDb(request.params.id))
        .then(GridFS.listDocumentFiles)
        .then((documents: any) => response.json(documents))
        .catch(next));

// Delete a News Item
server.delete('/api/newsitems/:id', (request: any, response: any, next: NextErr) => {

    rbac.can(request.session.role, 'newsitems:delete')
        .then(() => ttcDB.deleteNewsItem(request.params.id))
        .then(() => GridFS.deleteNewsItemFiles(request.params.id))
        .then(() => response.end())
        .catch(next);
});

// Get all the member records
server.get('/api/members', (request: any, response: any, next: NextErr) => {

    rbac.can(request.session.role, 'members:read')
        .then(ttcDB.getMembers)
        .then((members: any) => response.json(members))
        .catch(next)
});

// Get all Renewal records
server.get('/api/renewals', (request: any, response: any, next: NextErr) =>
    rbac.can(request.session.role, 'members:read')
        .then(ttcDB.getRenewals)
        .then((paidStatuses: any) => response.json(paidStatuses))
        .catch(next));

// Update a Renewal record
server.put('/api/renewals', (request: any, response: any, next: NextErr) =>
    rbac.can(request.session.role, 'members:read')
        .then(() => ttcDB.upsertRenewal(request.body))
        .then(() => response.end())
        .catch(next));

// Change a member's password
server.post('/api/members/:id/change-password', jsonParser, (request: any, response: any, next: NextErr) =>

    ttcDB.persistMemberChange(jwt.decode(request.params.id, process.env.SECRET_JWT_KEY)._id, { password: bcrypt.hashSync(request.body.password) })
        .then(() => response.end())
        .catch(next));

// Get a specific member record
server.get('/api/members/:id', (request: any, response: any, next: NextErr) =>

    ttcDB.findMember(jwt.decode(request.params.id, process.env.SECRET_JWT_KEY)._id)
        .then((member: any) => response.json(member))
        .catch(next));

// Update a member record
server.put('/api/members/:id', jsonParser, (request: any, response: any, next: NextErr) => {

    // If the member's role has changed, then the session needs to know
    if (request.body.role) {
        request.session.changeRole(request.body.role);
    }
    ttcDB.persistMemberChange(request.body._id, request.body)
        .then(MailChimp.addMember)
        .then((member: any) => response.json(member))
        .catch(next);
});

// A membership renewal
server.put('/api/members/:id/renew', jsonParser, (request: any, response: any, next: NextErr) => {

    ttcDB.persistMemberChange(request.body._id, request.body)
        .then(() => ttcDB.upsertRenewal({ memberId: request.body._id, renewed: true }))
        .then(() => response.end())
        .catch(next)
});

// Get the last 'n' eBlasts
server.get('/api/eblasts', (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'eblasts:read')
        .then(() => {
            // If cached eBlasts are available, then use them
            let cached_eBlasts = cache.get('eBlasts');
            if (cached_eBlasts) {
                response.end(cached_eBlasts);
            } else {
                // Get gmail access authorization and then get the eBlasts
                ttcGmail.authorizeGmailAccess()
                    .then(ttcGmail.geteBlasts)
                    .then((eBlasts: any[]) => response.json(eBlasts));
            }
        })
        .catch(next));

// Upload documents
server.post('/api/documents/upload', multer({ dest: './uploads/' }).array('uploads[]', 12), (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'documents:create')
        .then(() => {
            // Flag each file as category 'document'
            request.files.forEach((file: any) => {
                file.category = 'document';
                file.collection_id = null;
            });
            GridFS.saveFiles(request.files)
                .then(GridFS.retrieveAllDocuments)
                .then((Documents: any) => response.json(Documents))
                .catch(next);
        })
        .catch(next));


// Get the list of documents
server.get('/api/documents', (request: any, response: any, next: NextErr) =>

    GridFS.retrieveAllDocuments()
        .then((documents: any) => response.json(documents))
        .catch((err: Error) => next(err)));

// Get a new ObjectId
server.get('/api/newobject', (request: any, response: any) =>
    response.json(require('mongodb').ObjectID()));

// Upload News Item Images
server.post('/api/newsitems/:id/upload', multer({ dest: './uploads/' }).array('uploads[]', 12), (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'newsitems:create')
        .then(() => {
            // Flag each file as category 'newsitem'
            request.files.forEach((file: any) => {
                file.category = 'newsitem';
                // The following provides the linkage between a NewsItem and its related image files.
                file.collection_id = request.params.id;
            });
            GridFS.saveFiles(request.files)
                .then(() => response.end())
                .catch(next);
        })
        .catch(next));

// Publish a new News Item
server.post('/api/newsitems', jsonParser, (request: any, response: any, next: NextErr) =>

    rbac.can(request.session.role, 'newsitems:create')
        .then(() => ttcDB.publishNewsItem(request.body))
        .then(() => response.end())
        .catch(next));

// Capture all HTTP Errors
server.use((err: any, request: any, response: any, next: any) => {

    // Depending on the 'err' instance, select the appropriate HTTP status
    let status_code: number;
    if (err instanceof DuplicateMemberError) {
        status_code = HTTP_PreconditionFailed;
    } else if (err instanceof AuthenticationError) {
        status_code = HTTP_Unauthorized;
    } else if (err instanceof PaymentRequiredError) {
        status_code = HTTP_PaymentRequired;
    } else {
        status_code = HTTP_ServerError;
    }

    let errorString =
        'HTTP Error Code: ' + status_code +
        ' from ' + request.method + ' ' + request.path + '\n' +
        err.stack;

    // Record errorString to more than one place
    console.log(errorString);           // to the process log
    response.console.log(errorString);  // to Chrome Logger
    Track.Warning(errorString);         // to FogBugz

    response.sendStatus(status_code).end();
});

server.listen(process.env.PORT || 8000);

Track.InfoOnly('TTC Server Started');
console.log('TTC Server Started');

ttcDB.setupExec();
// ttcDB.setupRenewals();

module.exports = server;
