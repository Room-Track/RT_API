import onFinished from 'on-finished';
import type { RequestHandler } from 'express';

export const log = (msg: string | Array<string>, indent: number) => {
    const spacing = '    '.repeat(indent);
	if (typeof msg === 'string') {
        console.log(spacing + msg);
		return;
	}
	console.log(spacing + msg.join(' '));
};

const devlogger: RequestHandler = (req, res, next) => {
    const method = req.method;
	const url = req.originalUrl;
    
	const startTime = Date.now();
	onFinished(res, (err, response) => {
		if (err){
			log([`ERROR: ${err.name}`.red], 0);
			log(['message: ', err.message], 1);
			log(['cause: ', `${err.cause}`], 1);
			return;
		}
		const time = Date.now() - startTime;
		const status = response.statusCode;
		//@ts-ignore
		log([method.italic.bold,url.blue,status.toString().magenta,`${time}ms`.dim],
			0
		);
	});

	next();
};

type modes = 'dev' | 'min';

export default function Madlogger(mode: modes) {
	return devlogger;
}
