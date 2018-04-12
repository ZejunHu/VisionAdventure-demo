var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Apply Model
 * =============
 */

var Apply = new keystone.List('Apply', {
	nocreate: true,
	noedit: true,
});

Apply.add({
	name: { type: String, required: true },
	email: { type: Types.Email, required: true },
	birth: { type: String, required: true },
	sex: { type: Types.Select, options: [
		{ value: '男', label: '男' },
		{ value: '女', label: '女' },
	] },
	address: { type: String, required: true },
	province: { type: String, required: true },
	city: { type: String, required: true },
	phone: { type: String, required: true },
	wechat: { type: String, required: true },
	allergic: { type: String, required: true },
	parentName: { type: String, required: true },
	parentEmail: { type: Types.Email, required: true },
	parentBirth: { type: String, required: true },
	parentAddress: { type: String, required: true },
	parentProvince: { type: String, required: true },
	parentCity: { type: String, required: true },
	parentMobile: { type: String, required: true },
	parentPhone: { type: String },
	parentAllergic: { type: String, required: true },
	agent: { type: String },
	signature: { type: String, required: true },
	parentSignature: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
});

Apply.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Apply.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Apply.schema.methods.sendNotificationEmail = function (callback) {
	if (typeof callback !== 'function') {
		callback = function (err) {
			if (err) {
				console.error('There was an error sending the notification email:', err);
			}
		};
	}

	if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
		console.log('Unable to send email - no mailgun credentials provided');
		return callback(new Error('could not find mailgun credentials'));
	}

	var apply = this;
	var brand = keystone.get('brand');

	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);
		new keystone.Email({
			templateName: 'apply-notification',
			transport: 'mailgun',
		}).send({
		//	to: 'info@visionadventure.com',
		  to: 'wbsxbysharp@gmail.com',
			from: {
				name: 'VisionAdventure',
				email: 'info@visionadventure.com',
			},
			subject: 'New Apply for VisionAdventure',
			apply: apply,
			brand: brand,
			layout: false,
		}, callback);
	});
};

Apply.defaultSort = '-createdAt';
Apply.defaultColumns = 'name, phone, sex, createdAt';
Apply.register();
