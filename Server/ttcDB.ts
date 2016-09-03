/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/moment-node/index.d.ts" />

import * as moment from 'moment';

import { NewsItem } from '../app/models/newsitem';
import { AuthenticationError, DuplicateMemberError } from './error.classes';

const mongoose = require('mongoose');

require('mongoose').Promise = global.Promise;
require('dotenv').config();
const bcrypt = require('bcrypt-nodejs');

mongoose.connect(process.env.MONGO_DB);

// Setup the Mongoose models
let MemberSchema = new mongoose.Schema({
	emailaddress: { type: String, lowercase: true },
	password: { type: String },
	firstname: { type: String },
	familyname: { type: String },
	student: { type: Boolean, default: false },
	familyemailaddress: { type: String, lowercase: true, default: null },
	dob: Date,
	address: { type: String },
	place: { type: String },
	postcode: { type: String },
	primaryphone: { type: String },
	alternativephone: { type: String },
	liabilityagreed: { type: Boolean, default: false },
	communicationsagreed: { type: Boolean, default: false },
	photoagreed: { type: Boolean, default: false },
	joiningyear: { type: Number, default: null },
	exec: { type: String, lowercase: true, default: null },
	role: { type: String, lowercase: true, default: 'member' },
	// clientId: { type: String, default: uuid.v4(), unique: true },
    // clientSecret: { type: String, default: uuid.v4(), unique: true },
    // createdAt: { type: Date, default: Date.now },
    // name: { type: String, default:uuid.v4(), unique: true },
    // scope: { type: String },
    // userId: { type: String },
    // redirectUri: { type: String }
});

let MemberModel = mongoose.model('members', MemberSchema);

let NewsItemSchema = new mongoose.Schema({
	headline: String,
	body: String,
	uploadTimestamp: { type: Date, default: moment() }
});

let NewsItemModel = mongoose.model('newsitems', NewsItemSchema, 'newsitems');

let DeviceTrackingSchema = new mongoose.Schema({
	memberid: String,
	device: String,
	lastUsed: Date
});
let DeviceTrackingModel = mongoose.model('devicetracking', DeviceTrackingSchema, 'devicetracking');

let executiveSchema = new mongoose.Schema({
	rank: { type: Number },
	position: { type: String },
	title: { type: String },
	emailaddress: { type: String },
	exec_members: []
});
let executiveModel = mongoose.model('executive', executiveSchema, 'executive');

let RenewalSchema = new mongoose.Schema({
	memberId: { type: String },
	year: { type: Number },
	renewed: { type: Boolean, default: false },
	paid: { type: Boolean, default: false },
});
let RenewalModel = mongoose.model('renewals', RenewalSchema, 'renewals');

let logSchema = new mongoose.Schema({
	timestamp: { type: Date, default: moment() },
	message: { type: String },
	memberId: { type: String },
	firstname: { type: String },
	familyname: { type: String },
	device: { type: String }
});
let logModel = mongoose.model('log', logSchema, 'log');

let triviaSchema = new mongoose.Schema({
	trivia: { type: String }
});
let triviaModel = mongoose.model('trivia', triviaSchema, 'trivia');

let etiquetteSchema = new mongoose.Schema({
	trivia: { type: String }
});
let etiquetteModel = mongoose.model('etiquette', etiquetteSchema, 'etiquette');

// Constants
const UPDATE_OPTIONS = {
	multi: false,
	upsert: false,
	new: true
};
const UPSERT_OPTIONS = {
	multi: false,
	upsert: true,
	new: true
};

// Record user's device details.  If device is already known,
// then just update the lastUsed timestamp
exports.upsertDevice = (memberid: string, device: string) =>

	DeviceTrackingModel.findOneAndUpdate(
		{
			memberid: memberid,
			device: device
		},
		{
			$set: {
				memberid: memberid,
				device: device,
				lastUsed: moment()
			}
		},
		UPSERT_OPTIONS);

exports.publishNewsItem = (newsItem: NewsItem) =>
	NewsItemModel(newsItem).save();

exports.getNewsItems = () =>
	NewsItemModel.find();

exports.getNewsItemsCount = () =>
	NewsItemModel.count();

exports.deleteNewsItem = (newsItemId: string) =>
	NewsItemModel.findByIdAndRemove(newsItemId);

exports.countMembers = () =>
	MemberModel.count();

exports.getMembers = () =>
	MemberModel.find({}, '-password');

exports.getTrivia = () =>
	triviaModel.find({});

exports.getEtiquette = () =>
	etiquetteModel.find({});

exports.getRenewals = () =>
	RenewalModel.find({});

exports.upsertRenewal = renewal =>
	RenewalModel.findOneAndUpdate({ memberId: renewal.memberId, year: renewal.year }, renewal, UPSERT_OPTIONS);

exports.findMember = (_id: any) =>
	MemberModel.findById(_id, '-password');

exports.deleteMember = (_id: string) =>
	MemberModel.findByIdAndRemove(_id);

exports.persistMemberChange = (_id: string, member: any) =>
	MemberModel.findByIdAndUpdate(_id, member, UPDATE_OPTIONS);

exports.loginMember = (member: any) =>

	new Promise((resolve, reject) => {
		MemberModel.find({
			firstname: { $regex: member.firstname, $options: 'i' },
			emailaddress: { $regex: member.emailaddress, $options: 'i' }
		})
			.then((members: any[]) => {
				// Comparison must be done against a proper encrypted password
				if (members.length === 1 &&
					members[0].password &&
					members[0].password.length === 60 &&
					bcrypt.compareSync(member.password, members[0].password)) {
					resolve(members[0]);
				} else {
					reject(new AuthenticationError(''));
				}
			})
			.catch(reject);
	});

exports.signupMember = (member: any) =>

	new Promise((resolve, reject) => {
		// Look for a member whose details match all of the following
		MemberModel.find({
			firstname: { $regex: member.firstname, $options: 'i' },
			familyname: { $regex: member.familyname, $options: 'i' },
			emailaddress: member.emailaddress,
			postcode: member.postcode,
			dob: member.dob.slice(0, 10)
		})
			.then((members: any[]) => {
				if (members.length === 1) {
					// Record the encrypted form of the password to the database
					let signup_member = { password: bcrypt.hashSync(member.password) };
					this.persistMemberChange(members[0]._id, signup_member)
						.then(() => resolve(members[0]))
						.catch(reject);
				} else {
					(members.length > 1) ? reject(new Error('Signup is ambiguous')) : reject(new AuthenticationError('test'));
				}
			})
			.catch(reject);
	});

// Assure a member's credentials
exports.authorizeMember = (_id: string) =>
	MemberModel.findById(_id, '-password');

// Before accepting a new member application, ensure that the person is not already known.
exports.duplicateCheck = (member: any) =>

	new Promise((resolve, reject) => {
		MemberModel.find({
			emailaddress: member.emailaddress,
			firstname: { $regex: member.firstname, $options: 'i' }
		})
			.then((members: any[]) => members.length > 0 ? reject(new DuplicateMemberError('')) : resolve(member))
			.catch(reject);
	});

exports.saveNewApplicant = (member: any) => {

	member.dob = member.dob.slice(0, 10);
	return new Promise((resolve, reject) => {
		MemberModel(member).save()
			.then((saved_member: any) => {
				this.upsertRenewal({ memberId: saved_member._id, renewed: true });
				resolve(saved_member);
			})
			.catch(reject);
	});
}

exports.getExecutive = () =>
	executiveModel.find();

exports.logMessage = (message: any) =>
	logModel(message).save();

// The following function associates each of the executive positions with the
// names of the actual office holders.  Only called at startup
exports.setupExec = () =>
	this.getMembers()
		.then((members: any) => executiveModel.find()
			.then((execs: any) => {
				execs.forEach((exec: any) => {

					// Filter in details of board members holding exec positions
					exec.exec_members = members.filter((x: any) => x.exec === exec.position);

					// ...then record these associations back to executive
					executiveModel.findByIdAndUpdate(
						exec._id,
						exec,
						UPDATE_OPTIONS)
						.catch((err: any) => console.log('Aborting updating `executive`: ', err))
						.then();
				});
			})
			.catch((err: Error) => console.log('Cant get the members: ', err)));

exports.setupRenewals = () =>
	this.getMembers()
		.then((members: any) => {
			members.forEach((member: any) => {
				RenewalModel({ memberId: member._id, year: 2016, renewed: true, paid: true }).save()
					.then(() => { })
					.catch((err: any) => console.log('`renewals` collection not created: ', JSON.stringify(err)));
			});
		})
		.catch((err: any) => console.log('Error creating paid collection: ', err));

exports.deleteMembers = () =>
	MemberModel.remove((err: any, count: number) => {
		if (err) {
			console.log('Problem removing all member documents: ', err);
		} else {
			console.log('Member records deleted');
		}
	});

exports.deleteNewsItems = () =>
	NewsItemModel.remove((err: any, count: number) => {
		if (err) {
			console.log('Problem removing all News Items: ', err);
		} else {
			console.log('All News Items deleted');
		}
	});

exports.deleteRenewals = () =>
	RenewalModel.remove((err: any, count: number) => {
		if (err) {
			console.log('Problem removing all Renewals: ', err);
		} else {
			console.log('All Renewals deleted');
		}
	});
