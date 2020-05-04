const staticAssets = [
	'./index.html',
	'./dist/js/index.js',
	'./dist/js/Tone.js',
	'./dist/js/Tone.js.map',
	'./dist/css/app.css',
	'./dist/img/favicon.ico',
	'./dist/img/icons/icon-192x192.png',
	'./dist/img/icons/icon-128x128.png',
	'./dist/img/icons/icon-144x144.png',
	'./dist/img/icons/icon-72x72.png',
	'./dist/img/icons/icon-384x384.png',
	'./dist/img/icons/icon-96x96.png',
	'./dist/img/icons/icon-512x512.png',
	'./dist/img/icons/icon-152x152.png',
];

self.addEventListener('install', async () => {
    console.log("serverWorker install fired");
	const cache = await caches.open('static-cache');
    console.log("serverWorker pre cache.addAll", staticAssets);
	cache.addAll(staticAssets);
    console.log("serverWorker post cache.addAll", staticAssets);
});

self.addEventListener('fetch', event => {
	const req = event.request;
    console.log("serverWorker fetch fired", req.url);
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
