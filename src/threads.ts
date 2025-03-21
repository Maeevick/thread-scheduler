import querystring from 'node:querystring';
import type { Post, Thread, ThreadsPostResult } from './types.ts';

const postToThreads = async (
	post: Post,
	parent?: ThreadsPostResult
): Promise<ThreadsPostResult> => {
	console.log(`\n[Threads] Posting${parent ? ' as reply to ' + parent.id : ''}:`, post.content);
	console.log('\n------------\n');

	const params = `${post.image ? `media_type=IMAGE&image_url=${process.env.IMAGE_BASE_URL}${post.image.uri}&alt_text=${post.image.alt}` : 'media_type=TEXT'}&text=${querystring.escape(post.content)}`;

	if (parent) {
		return await fetch(
			`https://graph.threads.net/v1.0/me/threads?${params}&reply_to_id=${parent.id}&access_token=${process.env.THREADS_TOKEN}}`,
			{ method: 'POST' }
		)
			.then((response) => response.json())
			.then(({ id }) => {
				return fetch(
					`https://graph.threads.net/v1.0/me/threads_publish?creation_id=${id}&access_token=${process.env.THREADS_TOKEN}`,
					{ method: 'POST' }
				);
			})
			.then((response) => response.json());
	}

	return await fetch(
		`https://graph.threads.net/v1.0/me/threads?${params}&access_token=${process.env.THREADS_TOKEN}}`,
		{ method: 'POST' }
	)
		.then((response) => response.json())
		.then(({ id }) => {
			return fetch(
				`https://graph.threads.net/v1.0/me/threads_publish?creation_id=${id}&access_token=${process.env.THREADS_TOKEN}`,
				{ method: 'POST' }
			);
		})
		.then((response) => response.json());
};

const postSequence = async (posts: Post[]): Promise<ThreadsPostResult[]> => {
	const poster = postToThreads;
	const results: ThreadsPostResult[] = [];

	for (const post of posts) {
		const parent = results[results.length - 1];

		const result = await poster(post, parent);

		results.push(result);
	}

	return results;
};

export const postThreadOnThreads = async (thread: Thread): Promise<ThreadsPostResult[]> => {
	console.log('\n---------START POSTING ON THREADS---------\n');

	return await postSequence(thread.posts);
};
