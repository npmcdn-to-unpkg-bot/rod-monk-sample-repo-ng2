/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/moment-node/index.d.ts" />

import * as moment from 'moment';

const google = require('googleapis');
const googleAuth = require('google-auth-library');
const cache = require('memory-cache');
const Track = require('./ttcTrack');
require('dotenv').config();

// Get the OAuth2 client
exports.authorizeGmailAccess = () => {
	return new Promise((resolve, reject) =>
		fs.readFile(process.env.GMAIL_CLIENT_SECRET_JSON, (err: Error, content: any) => {
			if (err) {
				reject(err);
			} else {
				let credentials = JSON.parse(content);
				let clientSecret = credentials.installed.client_secret;
				let clientId = credentials.installed.client_id;
				let redirectUrl = credentials.installed.redirect_uris[0];
				let auth = new googleAuth();
				let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

				// Get the gmail api token
				fs.readFile(process.env.GMAIL_API_JSON, (err: Error, token: any) => {
					if (err) {
						reject(err);
					} else {
						oauth2Client.credentials = JSON.parse(token);
						resolve(oauth2Client);
					}
				});
			}
		})
	);
}

// Accumulate eBlasts
function recordEmail(eBlasts: any[], email_date: string, email_subject: string, email_snippet: string, email_body: string) {
	eBlasts.push({
		date: email_date,
		subject: email_subject,
		snippet: email_snippet,
		// Convert from Base64
		body: atob(email_body).replace(/Â/g, ' ')
	});
}

exports.geteBlasts = (auth: any) => {

	return new Promise((resolve, reject) => {

		let gmail = google.gmail('v1');

		// Get the most recent 'n' eBlasts from Google gmail
		let eBlastsCount = 20;

		// The Google API gives you a list of gmail IDs (with no details) and
		// then you get the details using gmail.users.messages.get
		gmail.users.messages.list({
			auth: auth,
			userId: 'me',
			maxResults: eBlastsCount,
			q: 'from:tsawwassentennisclub@gmail.com and to:tsawwassentennisclub@gmail.com'
		},
			(err: Error, list_response: any) => {
				if (err)
					reject(err);
				else {
					let eBlasts: any[] = [];

					async.each(
						list_response.messages,
						(email: any, callback: any) => {
							gmail.users.messages.get({ auth: auth, userId: 'me', id: email.id, format: 'full' },
								(err: Error, api_response: any) => {
									if (err)
										callback('gmail.users.messages.get returned error: ' + err);
									else {
										// Isolate the email Date and Subject
										let email_date: string;
										let email_subject: string;

										for (let k = 0; k < api_response.payload.headers.length; ++k) {
											if (api_response.payload.headers[k].name === 'Date') {
												email_date = moment(new Date(api_response.payload.headers[k].value)).format('YYYY-MM-DD');
											}
											if (api_response.payload.headers[k].name == 'Subject') {
												email_subject = api_response.payload.headers[k].value;
											}
										}

										// Search for the first body that has something readable, but prefer HTML
										let body_found = false;
										let mimeTypes = ["text/html", "text/plain"];
										find_body: {
											// First check the 'payload body'
											for (let m in mimeTypes) {
												if (api_response.payload.body.data && api_response.payload.mimeType == mimeTypes[m]) {
													body_found = true;
													recordEmail(eBlasts, email_date, email_subject, api_response.snippet, api_response.payload.body.data);
													break find_body;
												}
												// Next check the 'parts'
												if (api_response.payload.parts) {
													for (let j = 0; j < api_response.payload.parts.length; ++j) {
														if (api_response.payload.parts[j].body.data && api_response.payload.parts[j].mimeType == mimeTypes[m]) {
															body_found = true;
															recordEmail(eBlasts, email_date, email_subject, api_response.snippet, api_response.payload.parts[j].body.data);
															break find_body;
														}

														// Now check 'parts of parts'
														if (api_response.payload.parts[j].parts) {
															for (let k = 0; k < api_response.payload.parts[j].parts.length; ++k) {
																if (api_response.payload.parts[j].parts[k].body.data && api_response.payload.parts[j].parts[k].mimeType == mimeTypes[m]) {
																	body_found = true;
																	recordEmail(eBlasts, email_date, email_subject, api_response.snippet, api_response.payload.parts[j].parts[k].body.data);
																	break find_body;
																}
															}
														}
													}
												}
											}
										}
										if (body_found)
											callback(null);
										else {
											let err = Error('No text body found for eBlast id: ' + api_response.id);
											Track.Warning(err);
											callback(err);
										}
									}
								}
							)
						},
						// Now the 'final' async callback
						(err: Error) => {

							// Error or no error, send what we have
							console.log('Number of eBlasts: ', eBlasts.length);

							// Load the cache, but allow it to be occasionally refreshed
							cache.put('eBlasts', JSON.stringify(eBlasts), (86400 / 24) * 1000);

							resolve(eBlasts);
						}
					)
				}
			}
		)
	});
}
