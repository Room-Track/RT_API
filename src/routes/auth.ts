import { Router } from 'express';
import admin from 'firebase-admin';
const router = Router();

router.post('/signup', async (req, res) => {
	if (!req.body.email || !req.body.password) {
		res.status(400).json({ msg: 'Fields must be complete' });
		return;
	}
	const regex = RegExp(/[a-zA-Z0-9]+@usm\.cl/);
	const isUsmDomain = regex.test(req.body.email);
	if (!isUsmDomain) {
		res.status(400).json({ msg: 'Not authorized domain' });
		return;
	}
	try {
		const response = await admin.auth().createUser({
			email: req.body.email,
			password: req.body.password,
			emailVerified: false,
			disabled: false,
		});
		const token = await admin.auth().createCustomToken(response.uid);
		res.status(200).json({
			token: token,
		});
	} catch {
		res.status(500).json({
			msg: 'internal server error',
		});
	}
});

export default router;
