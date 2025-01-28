import { AtpAgent, RichText } from '@atproto/api';

import type { Post, Thread, BlueSkyPostResult, PostImage } from './types';

const initBlueSky = async (): Promise<AtpAgent> => {
	const blueSky = new AtpAgent({ service: 'https://bsky.social' });

	await blueSky.login({
		identifier: process.env.BLUESKY_IDENTIFIER!,
		password: process.env.BLUESKY_PASSWORD!
	});

	return blueSky;
};

const uploadImageToBlueSky = async (
	agent: AtpAgent,
	image: PostImage
): Promise<{
	blob: { ref: string; mimeType: string; size: number; original: unknown };
}> => {
	const imageData = await fetch(image.uri).then((d) => d.arrayBuffer().then((d) => Buffer.from(d)));

	const response = await agent.uploadBlob(imageData, {
		encoding: 'image/png'
	});

	return response.data;
};

const postToBlueSky = async (
	post: Post,
	parent?: BlueSkyPostResult,
	root?: BlueSkyPostResult
): Promise<BlueSkyPostResult> => {
	console.log(`\n[BlueSky] Posting${parent ? ' as reply to ' + parent.cid : ''}:`, post.content);
	console.log('\n------------\n');

	const blueSky = await initBlueSky();

	const rt = new RichText({
		text: post.content
	});

	if (post.link || post.tag) {
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

	return await blueSky.post(params);
};

const postSequence = async (posts: Post[]): Promise<BlueSkyPostResult[]> => {
	const poster = postToBlueSky;
	const results: BlueSkyPostResult[] = [];

	for (const post of posts) {
		const parent = results[results.length - 1];
		const root = results[0];
		const result = await poster(post, parent, parent ? root : undefined);

		results.push(result);
	}

	return results;
};

export const postThreadOnBlueSky = async (thread: Thread): Promise<BlueSkyPostResult[]> => {
	console.log('\n---------START POSTING ON BLUSKY---------\n');

	return await postSequence(thread.posts);
};
