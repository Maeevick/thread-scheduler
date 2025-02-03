import { Octokit } from '@octokit/rest';

import type { Thread } from './types.ts';

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

export const retrieveThreadContents = async (now: Date): Promise<Thread[]> => {
	console.log('\n---------RETRIEVING CONTENT FROM GITHUB---------');
	const { data: contents } = await octokit.repos.getContent({
		owner: process.env.GITHUB_OWNER ?? '',
		repo: process.env.GITHUB_REPO ?? '',
		path: process.env.GITHUB_FOLDER ?? ''
	});

	if (!Array.isArray(contents)) {
		return [];
	}

	return await Promise.all(
		contents
			.filter((file) => {
				const [, , hour, minutes] = file.name.match(/^(\d{8})T(\d{2})(\d{2})\.json$/) ?? [];
				const [scheduledHour, scheduledMinutes] = [Number(hour), Number(minutes)];

				const [nowHour, nowMinutes] = [
					Number(now.getUTCHours().toString().padStart(2, '0')),
					Number(now.getUTCMinutes().toString().padStart(2, '0'))
				];
				return (
					file.type === 'file' &&
					file.name.startsWith(
						`${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`
					) &&
					file.name.endsWith('.json') &&
					Math.abs(nowHour * 60 + nowMinutes - (scheduledHour * 60 + scheduledMinutes)) <= 15
				);
			})
			.map((file) => fetch(`${file.download_url}`).then((data) => data.json()))
	);
};
