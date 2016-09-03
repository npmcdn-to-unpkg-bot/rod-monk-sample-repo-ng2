/// <reference path="../typings/globals/node/index.d.ts" />

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fs = require('fs');
const async = require('async');
const conn = mongoose.connection;
const ObjectID = require('mongodb').ObjectID;

Grid.mongo = mongoose.mongo;

conn.on('error', console.error.bind(console, 'connection error:'));

function saveFileToDb(filepath: string, filename: string, category: any, collection_id: any) {

	return new Promise((resolve, reject) => {

		let gfs = Grid(conn.db);
		let writestream = gfs.createWriteStream({
			_id: new ObjectID(),
			filename: filename,
			metadata: { collection_id: collection_id, category: category }
		});
		fs.createReadStream(filepath).pipe(writestream);

		writestream.on('close', (file: any) => resolve(null));
	});
}

function saveFileToDbWithCallback(file: any, callback: any) {
	saveFileToDb(file.path, file.originalname, file.category, file.collection_id).then(callback).catch(callback);
}

exports.saveFiles = (files: any[]) => {
	return new Promise((resolve, reject) =>
		async.each(files, saveFileToDbWithCallback, (err: Error) => err ? reject(err) : resolve(null)));
}

exports.retrieveFileFromDb = (file: any) => {

	return new Promise((resolve, reject) => {

		// Create a file with a name of the form 'file._id.<ext>', where <ext> is the extension of the original file
		var filepath = __dirname + '/../' + file._id + '.' + file.filename.substr(file.filename.lastIndexOf('.') + 1);

		// Check whether the file already exists
		fs.open(filepath, 'r', (err: Error, fd: any) => {
			if (!err) {
				// File already exits
				fs.closeSync(fd);
				resolve(null);
			}
			else {
				// File does not exist...create it
				var fs_write_stream = fs.createWriteStream(filepath);

				var gfs = Grid(conn.db);

				// Read from mongodb
				var readstream = gfs.createReadStream({ _id: file._id });
				readstream.pipe(fs_write_stream);
				fs_write_stream.on('close', () => {
					resolve(null);
				});
				fs_write_stream.on('error', () => {
					err = Error('file creation error: ' + filepath);
					reject(err);
				});
			}
		});
	});
}

exports.removeFileFromDb = (_id: string) => {
	return new Promise((resolve, reject) =>
		Grid(conn.db).remove({ _id: _id }, (err: Error) => err ? reject(err) : resolve(null)));
}

// Required for async.each
exports.removeFileFromDbWithCallback = (file: any, callback: any) => {
	this.removeFileFromDb(file._id).then(callback).catch(callback);
}

exports.listDocumentFiles = () => {
	return new Promise((resolve, reject) =>
		Grid(conn.db).files.find({}).toArray((err: Error, files: any[]) => {
			if (err) {
				reject(err);
			}
			else {
				// Select only the 'document' category
				var Documents: any[] = [];
				files.forEach ((file: any) => {
					if (file.metadata.category === 'document')
						Documents.push(file);
				});
				resolve(Documents);
			}
		})
	);
}

// Required for async.each
exports.retrieveFileFromDbWithCallback = (file: string, callback: any) => {
	this.retrieveFileFromDb(file).then(callback).catch(callback);
}

exports.retrieveAllDocuments = () => {
	return new Promise((resolve, reject) =>
		this.listDocumentFiles()
			.then((Documents: any) =>
				async.each(Documents, this.retrieveFileFromDbWithCallback, (err: Error) => err ? reject(err) : resolve(Documents)))
			.catch(reject));
}

exports.listNewsItemFiles = (newsitemid: string) => {

	return new Promise((resolve, reject) => {

		var gfs = Grid(conn.db);
		gfs.files.find({}).toArray((err: Error, files: any[]) => {
			if (err) {
				reject(err);
			} else {
				let NewsItemFiles: any[] = [];
				files.forEach (file => {
					if (file.metadata.category === 'newsitem' && file.metadata.collection_id === newsitemid) {
						NewsItemFiles.push(file);
					}
				});
				resolve(NewsItemFiles);
			}
		});
	});
}

exports.retrieveNewsItemFiles = (newsitemid: string) => {
	return new Promise((resolve, reject) =>
		this.listNewsItemFiles(newsitemid)
			.then((NewsItemFiles: any[]) =>
				async.each(NewsItemFiles, this.retrieveFileFromDbWithCallback, (err: Error) => err ? reject(err) : resolve(NewsItemFiles))));
}

exports.deleteNewsItemFiles = (newsitemid: string) => {
	return new Promise((resolve, reject) =>
		this.listNewsItemFiles(newsitemid)
			.then((NewsItemFiles: any[]) =>
				async.each(NewsItemFiles, this.removeFileFromDbWithCallback, (err: Error) => err ? reject(err) : resolve(null))));
}


