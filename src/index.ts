import fs from 'fs/promises';
import dotenv from 'dotenv';

import { BskyAgent, RichText } from '@atproto/api';

dotenv.config();

type Platform = 'threads' | 'bluesky';

type PostImage = {
	path: string;
	alt?: string;
	mimeType: string;
};

type PostLink = {
	url: string;
};

type Post = {
	content: string;
	image?: PostImage;
	link?: PostLink;
};

type Thread = {
	scheduledFor: string;
	platforms: Platform[];
	posts: Post[];
};

type PostResult = {
	platform: Platform;
	uri: string;
	cid: string;
};

type ThreadResults = {
	[P in Platform]?: PostResult[];
};

const SAMPLE_THREAD: Thread = {
	scheduledFor: '2025-01-28T20:00:00Z',
	platforms: ['bluesky'],
	posts: [
		{
			content: 'Test from the Chaos! 👺',
			image: {
				path: 'static/Maeevicks_Bazaar.png',
				alt: "Maeevick's Bazaar",
				mimeType: 'image/png'
			}
		},
		{
			content: 'Reply from the Goblins! 👺'
		},
		{
			content: '🗞️ https://maeevick.substack.com',
			link: {
				url: 'https://maeevick.substack.com'
			}
		}
	]
};

const initBlueSky = async (): Promise<BskyAgent> => {
	const blueSky = new BskyAgent({ service: 'https://bsky.social' });

	await blueSky.login({
		identifier: process.env.BLUESKY_IDENTIFIER!,
		password: process.env.BLUESKY_PASSWORD!
	});

	return blueSky;
};

const uploadImageToBlueSky = async (
	agent: BskyAgent,
	image: PostImage
): Promise<{
	blob: { ref: string; mimeType: string; size: number; original: any };
}> => {
	const imageData = await fs.readFile(image.path);

	const response = await agent.uploadBlob(imageData, {
		encoding: image.mimeType
	});

	return response.data;
};

const postToBlueSky = async (
	post: Post,
	parent?: PostResult,
	root?: PostResult
): Promise<PostResult> => {
	console.log(`\n[BlueSky] Posting${parent ? ' as reply to ' + parent.cid : ''}:`, post.content);
	console.log('\n------------\n');

	const blueSky = await initBlueSky();

	const rt = new RichText({
		text: post.content
	});

	if (post.link) {
		rt.detectFacets(blueSky);
	}

	const params = {
		text: rt.text,
		facets: rt.facets,
		...(parent && {
			reply: {
				root: { uri: root?.uri || parent.uri, cid: root?.cid || parent.cid },
				parent: { uri: parent.uri, cid: parent.cid }
			}
		}),
		...(post.image && {
			embed: {
				$type: 'app.bsky.embed.images',
				images: [
					{
						image: (await uploadImageToBlueSky(blueSky, post.image)).blob,
						alt: post.image.alt ?? '',
						aspectRatio: { width: 1, height: 1 }
					}
				]
			}
		})
	};

	const response = await blueSky.post(params);

	return {
		platform: 'bluesky',
		uri: response.uri,
		cid: response.cid
	};
};

const postSequence = async (platform: Platform, posts: Post[]): Promise<PostResult[]> => {
	const poster = postToBlueSky;
	const results: PostResult[] = [];

	for (const post of posts) {
		const parent = results[results.length - 1];
		const root = results[0];
		const result = await poster(post, parent, parent ? root : undefined);

		results.push(result);
	}

	return results;
};

const postThread = async (thread: Thread): Promise<ThreadResults> => {
	console.log('\n---------START POSTING---------\n');
	const results: ThreadResults = {};

	await Promise.all(
		thread.platforms.map(async (platform) => {
			results[platform] = await postSequence(platform, thread.posts);
		})
	);

	return results;
};

postThread(SAMPLE_THREAD)
	.then((r) => {
		console.log('Success:', r);
	})
	.catch((e) => {
		console.error('Failure:', e);
	})
	.finally(() => {
		console.log('\n---------POSTING FINISHED---------');
	});
