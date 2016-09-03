/// <reference path="../typings/globals/node/index.d.ts" />

const https = require('https');
const md5 = require('md5');
const Track = require('./ttcTrack');
require('dotenv').config();
const MailChimpHostName = 'us12.api.mailchimp.com';
const MailChimpMembersPath = process.env.MAIL_CHIMP_MEMBERS_PATH;
const MailChimpAuthorization = process.env.MAIL_CHIMP_AUTHORIZATION;

function readResponseBody(response: any) {
	response.setEncoding('utf8');

	return new Promise(function (resolve, reject) {
		let body = '';
		response.on('readable', function () {
			let chunk = response.read();
			if (chunk) {
				body += chunk;
			}
		});
		response.on('end', function () {
			resolve(body);
		});
	});
}

exports.deleteMember = (emailaddress: string) => {

	var https_options = {
		hostname: MailChimpHostName,
		path: MailChimpMembersPath + md5(emailaddress),
		method: 'DELETE',
		headers: {
			'Authorization': MailChimpAuthorization
		}
	}

	return new Promise(function (resolve, reject) {
		// No 'reject' thus far

		var req = https.request(https_options, function (res: any) {
			readResponseBody(res)
				.then((body: any) => {
					if (res.Status < 200 || res.Status >= 300) {
						Track.InfoOnly('MailChimp API deleteMember', 'response.Status: ' + res.statusCode + ', response.Body: ' + body);
					}
				});
		});

		req.on('error', (err: Error) => {
			Track.Warning('MailChimp API deleteMember Warning', err.message);
		});

		req.end();
		resolve(null);
	});
}

exports.addMember = (member: any) => {

	var subscriber = JSON.stringify({
		'email_address': member.emailaddress,
		'status': 'subscribed',
		'merge_fields': {
			'FNAME': member.firstname,
			'LNAME': member.familyname
		}
	});

	var https_options = {
		hostname: MailChimpHostName,
		path: MailChimpMembersPath,
		method: 'POST',
		headers: {
			'Authorization': MailChimpAuthorization,
			'Content-Type': 'application/json',
			'Content-Length': subscriber.length
		}
	}

	return new Promise(function (resolve, reject) {
		// No 'reject' thus far

		var req = https.request(https_options, (res: any) => {
			readResponseBody(res)
				.then(function (body) {
					if (res.Status < 200 || res.Status >= 300)
						Track.InfoOnly('MailChimp API addMember', 'response.Status: ' + res.statusCode + ', response.Body: ' + body);
				});
		});

		req.on('error', function (err: Error) {
			Track.Warning('MailChimp API addMember Warning', err.message);
		});

		req.write(subscriber);
		req.end();
		resolve(member);
	});
}
