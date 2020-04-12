const staticAssets = [
	'/sandbox/drum/index.html',
	'/sandbox/drum/dist/img/favicon.ico',
	'/sandbox/drum/dist/css/app.css',
	'/sandbox/drum/dist/js/index.js',
	'/sandbox/drum/dist/js/Tone.js',
];

self.addEventListener('install', async () => {
	const cache = await caches.open('static-cache');
	cache.addAll(staticAssets);
});

self.addEventListener('fetch', event => {
	const req = event.request;
	const url = new URL(req.url);
    console.log("fetching", req.url);

	if (url.origin === location.url) {
		event.respondWith(cacheFirst(req));
	} else {
		event.respondWith(networkFirst(req));
	}
});

async function cacheFirst (req) {
	const cachedResponse = caches.match(req);
	return cachedResponse || fetch(req);
}

async function networkFirst (req) {
	const cache = await caches.open('dynamic-cache');

	try {
		const res = await fetch(req);
		cache.put(req, res.clone());
		return res;
	} catch (error) {
		return await cache.match(req);
	}
}
