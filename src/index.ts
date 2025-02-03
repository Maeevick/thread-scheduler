import dotenv from 'dotenv';

import { retrieveThreadContents } from './github.ts';
import { postThreadOnBlueSky } from './bluesky.ts';
import { postThreadOnThreads } from './threads.ts';

dotenv.config();

console.log('\n---------THREAD-SCHEDULER HAS STARTED---------\n');
const threads = await retrieveThreadContents(new Date());

if (!threads.length) {
	console.log('\n---------NO THREAD SCHEDULED---------');
}
for (const thread of threads) {
	console.log('\n---------POSTING THREAD---------');
	await Promise.all([postThreadOnThreads(thread), postThreadOnBlueSky(thread)])
		.then((r) => {
			console.log('SUCCESS:', r);
		})
		.catch((e) => {
			console.error('FAILURE:', e);
		})
		.finally(() => {
			console.log('\n---------POSTING FINISHED---------');
		});
}
console.log('\n---------THREAD-SCHEDULER HAS FINISHED---------');
