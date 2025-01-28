import dotenv from 'dotenv';
import { postThreadOnBlueSky } from './bluesky.ts';
import { postThreadOnThreads } from './threads.ts';
import { THREAD_20250128 } from '../static/20250128.ts';

dotenv.config();

Promise.all([postThreadOnThreads(THREAD_20250128), postThreadOnBlueSky(THREAD_20250128)])
	.then((r) => {
		console.log('SUCCESS:', r);
	})
	.catch((e) => {
		console.error('FAILURE:', e);
	})
	.finally(() => {
		console.log('\n---------POSTING FINISHED ON BLUESKY---------');
	});
