var keystone = require('keystone');
var Apply = keystone.list('Apply');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'apply';
	locals.applyTypes = Apply.fields.applyType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.applySubmitted = false;

	// On POST requests, add the Apply item to the database
	view.on('post', { action: 'apply' }, function (next) {

		var newApply = new Apply.model();
		var updater = newApply.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, applyType, message',
			errorMessage: 'There was a problem submitting your apply:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.applySubmitted = true;
			}
			next();
		});
	});

	view.render('apply');
};
