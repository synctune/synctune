# SyncTune

A music synchronization web application.

The deployed site can be found at [synctune.app](https://synctune.app/)

## Demo

YouTube link: https://youtu.be/8_DliIMWoOM


## Introduction

Synctune is a web application that uses WebRTC to allow for music synchronization between multiple devices, essentially creating one big speaker. 


## Browser Support

For the best and most consistent experience, we recommend using Chrome. Due to a bug with PeerJS, Firefox does not always work.


## Project Contributors

* [Anton Kaminsky](https://github.com/nakamin)
* [Alex Greff](https://github.com/alex-greff)


## Documentation 

The documentation website can be found at [docs.synctune.app](https://docs.synctune.app/)


## Key Features

Users are able to create or join existing rooms. Short room IDs are generated automatically which can be easily shared.

Room owners have complete control over the audio being played and can upload any audio file (mp3 or wav recommended) which will be automatically synced to all connected clients.

Time synchronization is done automatically whenever a client is joined but manual synchronization can also be triggered by the room owner, if need be.

Device-specific audio delay issues (that can't be fixed with time synchronization) on client devices can be manually compensated for using the compensation controls provided on the client devices.

## Technologies
* [Node JS](https://nodejs.org/en/) / [Express](https://expressjs.com/): used for the room server
* [Vue JS](https://vuejs.org/): the frontend framework used for the client
* [TypeScript](https://www.typescriptlang.org/): our choice language for writing both the client and room server
* [Redis](https://redis.io/): key-value storage used by the room server to store the currently open rooms
* [Peer JS](https://peerjs.com/): the library used for handling WebRTC connections between the room owner and clients
* [PeerServer](https://github.com/peers/peerjs-server): the server used to broker WebRTC connections 
* [VuePress](https://vuepress.vuejs.org/): the static site generator used for our documentation site
* [Heroku](https://www.heroku.com/): our choice platform for deploying the room and peer servers
* [Netlify](https://www.netlify.com/): the CDN/deployment platform used to deploy the frontend client and documentation site
* [Docker / Docker Compose](https://www.docker.com/) (development): used in our one-stop development environment setup
* [Nginx](https://www.nginx.com/) (development): used as a reverse-proxy for our development environment

## Top 5 Technical Challenges
1. **Time Synchronization:** getting this right was very tricky process as any small hiccup can cause desynchronization to occur. We ended up using [timesync](https://www.npmjs.com/package/timesync) to synchronize the clocks between all the connected clients in a room which allowed us to send time-synchronized play signals to each client.
2. **Accurate setTimeout Callbacks:** one inherit flaw of JavaScript's event-driven architecture is that [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout) is not entirely accurate and can have overshoots of up to around `50ms`. Since we needed accurate asynchronous timeouts for handling playing audio at the right time we needed to find a solution for this. 
3. **Audio Data Synchronization between Clients:** one issue that we came across was that Chrome has a limit on the file size of a data blob that it will send over a WebRTC connection, and will fail silently. We ended up having to split the file into small chunks that were sent over the WebRTC connection before being pieced back together on the other side.
4. **Inconsistencies with Web Audio API between Devices:** while testing we found two major device-specific issues that would break audio synchronization:
    
    1. Some devices have audio drivers that go to "sleep" when inactive which causes a slight delay for the audio to be played upon "waking up". As a result oftentimes the first audio being played on the device was heavily de-synced. Fortunately, simply stopping and starting the audio would fix this issue.
    
    2. Other devices would just always have a delay from the time the start method call was run and the time the audio actually started playing, no matter what. To fix this, we implemented a manual correction system that the connected client devices can use to manually re-sync their audio back up.

5. **Key Libraries Missing Needed Features:**

    1. The library used for clock synchronization ([Timesync](https://www.npmjs.com/package/timesync)) and the audio-visualizer library ([AudioMotion-Analyzer](https://www.npmjs.com/package/audiomotion-analyzer)) both did not have any TypeScript declaration files written for them so we had to write them ourselves. 

    2. [AudioMotion-Analyzer](https://www.npmjs.com/package/audiomotion-analyzer) as was missing a couple of features that we needed (transparent canvas background and rounded audio bar corners) so we had to [fork](https://github.com/alex-greff/audioMotion-analyzer) it and develop the features ourselves. To be clear, the other features it offered were exactly what we were looking for and it would have been more difficult to search for a different library so we decided that it was worth it to just extend the library ourselves. 
    

## Deployment

For deployment we had two goals in mind:
1. Be able to host it for as long as possible
2. Make it as free as possible (which ties into point #1)

As a result we decided to deploy SyncTune on a mix between Heroku and Netlify. The Heroku student pack provided us with a free [Hobby Dino](https://www.heroku.com/github-students) (no 30 minute sleep counter) for up to 2 years as well as a free Redis instance to use. Netlify also has an amazing free tier for deploying static content with an intuitive builtin CI/CD pipeline. The room and peer servers were hosted with Heroku while the client was statically hosted on Netlify.


## Development

The development environment has been containerized using Docker and Docker-Compose. This allows for a streamlined environment setup and configuration (no going around starting up 3+ different servers).

To start the development environment, simply type the following command

```
npm run start:dev
```

Then connect to `localhost:3050`

### NPM Scripts

Below are some useful NPM scripts for development

#### Environments

-   `dev`: the development environment

#### Services

-   `reverse-proxy`: the reverse-proxy container using Nginx
-   `client`: the Vue frontend SPA container
-   `room-server`: the Node JS room server container
-   `peer-server`: the signalling server container

#### Commands

-   `start:[environment]`: starts up the given environment
-   `rm-services:[environment]--[?service]`: removes given services from Docker. if no specific service is provided then all are removed
-   `restart:[environment]--[?service]`: hot restarts the given service. If no specific service is specified then all are restarted
-   `stop:[environment]`: stops the given environment
-   `shell:[service]`: opens an interactive shell into the given running service container

## Common Debugging Tips

### Hanging on Room Joining Screen

Possible Solutions:

* disconnect any other RTC-based apps running in the browser (we found that Messenger calls would stop some devices from joining)
* try reloading the web page of the joining client
* try restarting the browser for the client and/or room owner
* try clearing the webpage's cache
