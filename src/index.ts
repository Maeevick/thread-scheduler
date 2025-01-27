import dotenv from 'dotenv';

import { postThreadOnBlueSky, SAMPLE_BLUESKY } from './bluesky.ts';
import { postThreadOnThreads, SAMPLE_THREADS } from './threads.ts';

dotenv.config();

Promise.all([postThreadOnThreads(SAMPLE_THREADS), postThreadOnBlueSky(SAMPLE_BLUESKY)])
	.then((r) => {
		console.log('Success:', r);
	})
	.catch((e) => {
		console.error('Failure:', e);
	})
	.finally(() => {
		console.log('\n---------POSTING FINISHED ON BLUESKY---------');
	});
