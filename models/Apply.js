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
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String, required: true },
	applyType: { type: Types.Select, options: [
		{ value: 'message', label: '留言信息' },
		{ value: 'question', label: '问题咨询' },
		{ value: 'other', label: '其他' },
	] },
	message: { type: Types.Markdown, required: true },
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
			to: 'info@visionadventure.com',
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
Apply.defaultColumns = 'name, email, applyType, createdAt';
Apply.register();
