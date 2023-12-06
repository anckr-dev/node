module.exports = (S3_client) => {
	const bucketName = process.env.S3_BUCKET_NAME;
	const region = process.env.S3_REGION;
	const accessKeyId = process.env.S3_ACCESS_KEY_ID;
	const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
	const sharp = require("sharp");

	const s3 = new S3_client({
		region,
		accessKeyId,
		secretAccessKey,
	});

	return {
		// UPLOAD FILE TO S3
		uploadFile: async function (file, callback) {
			try {
				let buffer = await sharp(file.buffer)
					.resize({ height: 168, width: 168, fit: "contain" })
					.toBuffer();
				const uploadParams = {
					Bucket: bucketName,
					Body: buffer,
					Key: new Date().valueOf() + file.originalname,
				};
				const uploadPromise = s3.upload(uploadParams).promise(); // this will upload file to S3
				// handle promise's fulfilled/rejected states
				uploadPromise.then(
					function (uploadData) {
						/* process the data */
						callback(null, uploadData);
					},
					function (error) {
						/* handle the error */
						callback(error);
					},
				);
			} catch (e) {
				callback(e);
			}
		},
		// DOWNLOAD FILE FROM S3
		getFileStream: function (fileKey, callback) {
			const downloadParams = {
				Key: fileKey,
				Bucket: bucketName,
			};
			callback(null, s3.getObject(downloadParams).createReadStream());
		},
	};
};
