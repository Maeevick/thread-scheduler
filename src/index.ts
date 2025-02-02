import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

import type { Thread } from './types.ts';

import { postThreadOnBlueSky } from './bluesky.ts';
import { postThreadOnThreads } from './threads.ts';

dotenv.config();

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

const retrieveThreadContents = async (now: Date) => {
	console.log('\n---------RETRIEVING CONTENT FROM GITHUB---------');
	const { data: contents } = await octokit.repos.getContent({
		owner: 'Maeevick',
		repo: 'thread-scheduler',
		path: 'content'
	});

	if (!Array.isArray(contents)) {
		return [];
	}

	return contents.filter(
		(file) =>
			file.type === 'file' &&
			file.name.startsWith(
				`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`
			) &&
			file.name.endsWith('.json')
	);
};

const processThreadContent = async (thread: Thread) => {
	console.log('\n---------POSTING THREAD---------');
	return await Promise.all([postThreadOnThreads(thread), postThreadOnBlueSky(thread)])
		.then((r) => {
			console.log('SUCCESS:', r);
		})
		.catch((e) => {
			console.error('FAILURE:', e);
		})
		.finally(() => {
			console.log('\n---------POSTING FINISHED---------');
		});
};

const now = new Date();
console.log('\n---------THREAD-SCHEDULER HAS STARTED---------\n', now);
const files = await retrieveThreadContents(now);
for (const file of files) {
	const [, , hour, minutes] = file.name.match(/^(\d{8})T(\d{2})(\d{2})\.json$/) || [];
	const [scheduledHour, scheduledMinutes] = [Number(hour), Number(minutes)];

	const [nowHour, nowMinutes] = [
		Number(now.getUTCHours().toString().padStart(2, '0')),
		Number(now.getUTCMinutes().toString().padStart(2, '0'))
	];

	if (Math.abs(nowHour * 60 + nowMinutes - (scheduledHour * 60 + scheduledMinutes)) <= 15) {
		console.log('THREAD IS SCHEDULED, FETCH IT');
		const thread = await (await fetch(`${file.download_url}`)).json();

		await processThreadContent(thread);
	}

	console.log('\n---------THREAD-SCHEDULER HAS FINISHED---------');
}
