type PostImage = {
	url: string;
	alt?: string;
};

type PostLink = {
	url: string;
};

type Post = {
	content: string;
	image?: PostImage;
	link?: PostLink;
	tag?: string;
};

type Thread = {
	scheduledFor: string;
	posts: Post[];
};

type PostResult = {
	id: string;
};

const postToThreads = async (post: Post, parent?: PostResult): Promise<PostResult> => {
	console.log(`\n[Threads] Posting${parent ? ' as reply to ' + parent.id : ''}:`, post.content);
	console.log('\n------------\n');

	const params = `${post.image ? `media_type=IMAGE&image_url=${post.image.url}&alt_text=${post.image.alt}` : 'media_type=TEXT'}&text=${post.tag ? post.content.replace('#', '%23') : post.content}`;

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

const postSequence = async (posts: Post[]): Promise<PostResult[]> => {
	const poster = postToThreads;
	const results: PostResult[] = [];

	for (const post of posts) {
		const parent = results[results.length - 1];

		const result = await poster(post, parent);

		results.push(result);
	}

	return results;
};

export const postThreadOnThreads = async (thread: Thread): Promise<PostResult[]> => {
	console.log('\n---------START POSTING ON THREADS---------\n');

	return await postSequence(thread.posts);
};

export const SAMPLE_THREADS: Thread = {
	scheduledFor: '2025-01-28T20:00:00Z',
	posts: [
		{
			content: 'Test from the Chaos! 👺',
			image: {
				url: 'https://raw.githubusercontent.com/Maeevick/thread-scheduler/refs/heads/main/static/Maeevicks_Bazaar.png',
				alt: "Maeevick's Bazaar"
			}
		},
		{
			content: 'Reply from the Goblins! 👺 #indiehacker',
			tag: '#indiehacker'
		},
		{
			content: '🗞️ https://maeevick.substack.com',
			link: {
				url: 'https://maeevick.substack.com'
			}
		}
	]
};
