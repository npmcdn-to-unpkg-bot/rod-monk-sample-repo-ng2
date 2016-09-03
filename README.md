# TTCWebSite
The site is running at https://ttc-website-ng2.herokuapp.com.  The JS framework being used is Angular 2.0 (ng2) with NodeJS / Express providing the backend services.  MongoDB 3.2 provides the database services.  This repository forms part of a wider professional software engineering portfolio maintained by Rod Monk.  This repo is NOT the complete source code, as certain key information has been removed.  Nevertheless, to the maximum extent possible this repo is a close approximation of the source code.  It is currently actively being upgraded as noted in the ToDo list found below.<br>
<br>
<b>NOTE 1:</b>
A first visit to the site may seem slow, as it is running on a free Heroku servelet, which goes offline if the site is not accessed for more than 60 minutes.
<br>
<b>NOTE 2:</b>
If the reader wishes to actually Login, use the following Login credentials: name: 'test', email address: test@example.com, password: 12345678.  
All data that is accessible from this site is 'fake data', hence no damage can accrue.<br>
<br>
Other than demonstrating the use of Angular2 and Typescript, the goals of the site are the following:
<ol>
<li>To provide all of the content that the legacy 'static' website ('Home page', 'How to Find Us', 'Calendar', 'News', 'About Us', 'Contact Us', etc.</li>
<li>To be secure (see <b>Security</b> below).</li>
<li>To be responsive.</li>
<li>To demonstrate the use of REST-ful design principles in the crafting of the API end-points.
<li>Allow members to 'Login'.</li>
<li>Allow members to securely search the Membership contacts details (once logged in).</li>
<li>Allow the membership to modify their own profile details.</li>
<li>Allow the members to change their password.</li>
<li>Provide an application form for new members.</li>
<li>A means for existing members to renew their membership.</li>
<li>A means to distinguish executive members (who are given an extra range of privileges).</li>
<li>ToDo: A means for the membership to review historical eBlasts.</li>
<li>ToDo: A new <b>TennisBC Export</b> function: this will allow a member of the executive to export the membership list to TennisBC (required once per year).</li>
<li>A <b>Fee Accounting</b> function: When applying, will allow a member to specify other members within the same family; this feature will allow the site to auto-determine each family's yearly fees.</li>
<li>A <b>Document Management</b> function: members of the executive will be able to add documents to a document repository (e.g. minutes of meetings, club bylaws, etc.).  The general membership will be able to view these documents.</li>
<li>A <b>News Item Management</b> function: members of the executive will be able to add news items to the website (typically club successes in league play).  The general membership will be able to view these news items.  A news item consists of text and pictures.  They are to be displayed in the website in reverse chronological order.</li>
<li>A technical interface to FogBugz which will automatically record software failures (FogBugz is an issue tracking system).</li>
</ol>

<h4>Technologies</h4>
NodeJS, Express, Angular2, Bootstrap, MongoDB, Mongoose, Git, GitHub, Wepback, Gulp, and several npm packages (jwt-simple, bcrypt, async, gridfs-stream, moment, lodash, express-session, and several others).

<h4>Database</h4>
MongoDB available via MongoLab.

<h4>Server</h4>
Currently running on a Heroku servelet.

<h4>Security</h4>
<ol>
<li>Passwords are hashed (bcrypt) and stored to the database, along with the member's other details.</li>
<li>SSL is assumed throughout.</li>
<li>Session Management</li>
<ul>
<li>Users are identified using JSON Web Tokens (JWT); these are encrypted and not decodable when saved in Local Storage.</li>
<li>Independently of JWT usage, typical session management is active.  Session tokens time-out periodically and the user is then required to re-Login.</li>
<li>The client-side software prohibits users from accessing functions to which they are not authorized to use.  Nevertheless, at the server, further role-based checks are applied before executing an API endpoint.</li>
</ul>
</ol>
<h4>File Structure</h4>

```
ttc-website-ng2/
├── App/                                * Where our client-side application code is stored
│   ├── main.ts                         * From where Angular2 bootstraps the applicaton
│   └── app.component.ts                * The top-level application code (called from main.ts)
│     
│   ├── services/                       * Angular2 services
│   │   ├── document.service.ts         * Provides the http services to the server concerning all things Documents
│   │   ├── executive.service.ts        * Provides the http services providing details about the club executive
│   │   ├── member.service.ts           * Provides the http services to the server concerning all things Members
│   │   ├── newsitem.service.ts         * Provides the http services to the server concerning all things News Items
│   │   ├── observable.service.ts       * A base class that provides a common set of services that use the RxJS library
│   │   ├── platform.service.ts         * Provides services to capture the client software platform that a User is running
│   │   ├── normalization.service.ts    * Provides services to capture the client software platform that a User is running
│   │   ├── user.service.ts             * Provides services to capture the client software platform that a User is running
│   │   └── valdiation.service.ts       * Provides a number of common form validation services
|   | 
│   ├── models/                         * Various data models
│   │   ├── member.ts                   * A member structure
│   │   ├── newsitem.ts                 * A newsitem structure
│   │   └── renewal.ts                  * A renewal structure (members 'renew' each year)
|   | 
│   ├── about-us/                       * The About Us screen
│   ├── base-editor/                    * Base Editor from which other editors are derived
│   ├── calendar/                       * The Calendar screen
│   ├── change-password/                * The modal that allows a member to change their password
│   ├── communications-consent/         * A modal to display the comunications agreement that all members must agree to
│   ├── confirm-delete/                 * A general Confirm Delete modal
│   ├── contact-us/                     * The Contact Us screen
│   ├── document-manager/               * The Document Manager screen (allows to both add and view club documents)
│   ├── fee-configuration/              * The Fee Configuration screen (useful to the Treasurer and Admin personnel)
│   ├── fee-manager/                    * The Fee Manager screen (mostly for use by the Treasurer)
│   ├── home/                           * The Home screen
│   ├── join/                           * The Join modal which allows othersiders to apply to join the club
│   ├── login/                          * The Login modal
│   ├── liability-agreement/            * A modal to display the liability agreement that all members must agree to
│   ├── logout/                         * The Logout modal
│   ├── message/                        * A general modal for displaying messages
│   ├── mission-and-values/             * The Mission & Values modal
│   ├── newsitem/                       * The News Item screen (displays News Items)
│   ├── newsitem-manager/               * The News Item Manager modal (News Items are published here)
│   ├── online-help/                    * The Online Help screen
│   ├── personal-profile/               * The Personal Profile modal
│   ├── renew-membership/               * The Renew Membership modal
│   └── search-membership/              * The Search Membership screen
│   
├── Assets/                             * various project assets
│   ├── css/                            * Project CSS files
│   └── images/                         * Project images
│
├── build/                              * Webpack distribution output files
│   ├── ttc-bundle.js                   * Application webpack
│   └── vendor.js                       * Vendors webpack
│     
├── favicon.ico                         * Project favicon
│
├── Server/                             * NodeJS source code
│   ├── member_roles.ts                 * Role-based access control (RBAC) configuration
│   ├── Server.ts                       * The main server source file (contains the Express setup)
│   ├── ttcDB.ts                        * CRUD operations to / from MongoDB
│   ├── ttcGmail.ts                     * Retrieves historical emails from gmail
│   ├── ttcGridFS.ts                    * Stores / retrieves files from GridFS
│   ├── ttcMailChimp.ts                 * Update MailChimp with email addresses
│   ├── ttcGmail.ts                     * Retrieves historical emails from gmail
│   ├── ttcTrack.ts                     * Automatic issue tracking to FogBugz
│   │
│   └── test/                           * Server test folder
│       └── test-server.ts              * A test script to test NodeJS / Express
│   
├── index.html                          * HTML entry point
├── package.json                        * JavaScript dependencies
├── README.md                           * This file
├── tsconfig.json                       * Configures the TypeScript compiler
├── tslint.json                         * Configures our TypeScript linter 
├── typings/                            * Managed typings
└── webpack.config.js                   * webpack configuration file
```

<h4>ToDo List</h4>
<ul>
<li>Export to TennisBC</li>
<li>Resurrect Historical eBlasts (to work off the newsletter email address)</li>
<li>Improve presentation of news items</li>
<li>Restore a Coaching page</li>
<li>Provide user level documention</li>
<li>Provide technical documentation</li>
<li>Provide chat room features</li>
<li>Use ng2-table for Fee Management and Fee Configuraiton screens</li>
</ul>
