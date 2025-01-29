import dotenv from 'dotenv';
import { postThreadOnBlueSky } from './bluesky.ts';
import { postThreadOnThreads } from './threads.ts';
import { THREAD } from '../static/sample.ts';

dotenv.config();

Promise.all([postThreadOnThreads(THREAD), postThreadOnBlueSky(THREAD)])
	.then((r) => {
		console.log('SUCCESS:', r);
	})
	.catch((e) => {
		console.error('FAILURE:', e);
	})
	.finally(() => {
		console.log('\n---------POSTING FINISHED ON BLUESKY---------');
	});
