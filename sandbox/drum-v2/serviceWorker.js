const staticAssets = [
	'./index.html',
	'./dist/img/favicon.ico',
	'./dist/css/app.css',
	'./dist/js/index.js',
	'./dist/js/Tone.js',
	'./dist/js/Tone.js.map',
];

self.addEventListener('install', async () => {
    console.log("serverWorker install fired");
	const cache = await caches.open('static-cache');
    console.log("serverWorker pre cache.addAll", staticAssets);
	cache.addAll(staticAssets);
    console.log("serverWorker post cache.addAll", staticAssets);
});

self.addEventListener('fetch', event => {
    console.log("serverWorker fetch fired", req.url);
	const req = event.request;
    console.log("fetching", req.url);
	const url = new URL(req.url);
    console.log("comparing url.origin=", url.origin, " with location.url=", location.url);

	if (url.origin === location.url) {
        console.log("fetching from cache", req);
		event.respondWith(cacheFirst(req));
	} else {
        console.log("NOT fetching from cache", req);
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
