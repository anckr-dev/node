module.exports = (crypto, config) => {
	return {
		encodeData: function (data, callback) {
			try {
				let secret = Buffer.concat(
					[Buffer.from(config.cryptoAuth.secretKey), Buffer.alloc(32)],
					32,
				);
				let cipher = crypto.createCipheriv(
					config.cryptoAuth.algorithm,
					secret,
					config.cryptoAuth.initVector,
				);
				let encrypted = cipher.update(data, "utf8", "base64");
				encrypted += cipher.final("base64");
				callback(null, encrypted);
			} catch (e) {
				callback(e);
			}
		},
		decodeData: function (encryptedHash, callback) {
			try {
				let secret = Buffer.concat(
					[Buffer.from(config.cryptoAuth.secretKey), Buffer.alloc(32)],
					32,
				);
				let decipher = crypto.createDecipheriv(
					config.cryptoAuth.algorithm,
					secret,
					config.cryptoAuth.initVector,
				);
				let decrypted = decipher.update(encryptedHash, "base64", "utf8");
				const decryptedData = decrypted + decipher.final("utf8");
				callback(null, decryptedData);
			} catch (e) {
				callback(e);
			}
		},
	};
};
