const CACHE_NAME = 'simple-pwa-cache-v2'; // Increment the cache version when making changes

const urlsToCache = [

    '/manifest.json',

    '/icono.png'

];



self.addEventListener('install', event => {

    // Perform install steps

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                console.log('Opened cache');

                return cache.addAll(urlsToCache);

            })

    );

});



self.addEventListener('fetch', event => {

    const { request } = event;



    // Skip caching for homepage (root page or index.html) and file upload requests

    if ((request.url === '/' || request.url.endsWith('/index.html')) || request.url.includes('/upload')) {

        return;

    }



    event.respondWith(

        caches.match(request)

            .then(response => {

                // Cache hit - return response

                if (response) {

                    return response;

                }



                // Clone the request because it's a stream that can only be consumed once

                const fetchRequest = request.clone();



                return fetch(fetchRequest)

                    .then(response => {

                        // Check if we received a valid response

                        if (!response || response.status !== 200 || response.type !== 'basic') {

                            return response;

                        }



                        // Clone the response because it's a stream that can only be consumed once

                        const responseToCache = response.clone();



                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(request, responseToCache);

                            });



                        return response;

                    });

            })

    );

});



self.addEventListener('activate', event => {

    const cacheWhitelist = [CACHE_NAME];



    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames.map(cacheName => {

                    if (cacheWhitelist.indexOf(cacheName) === -1) {

                        // Delete old cache entries that are not in cacheWhitelist

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

});
