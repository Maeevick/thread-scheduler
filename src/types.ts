export type PostImage = {
	uri: string;
	alt?: string;
};

export type Post = {
	content: string;
	image?: PostImage;
	link?: string;
	tag?: string;
};

export type Thread = {
	scheduledFor: string;
	posts: Post[];
};

export type BlueSkyPostResult = {
	uri: string;
	cid: string;
};

export type ThreadsPostResult = {
	id: string;
};
