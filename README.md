# archipel-app

WIP

```
npm install
npm run bootstrap
npm start
```

Then open http://localhost:8080











# BERMUDA

BERMUDA is a decentralized archiving and media library system. It's the centerpiece of *[https://archipel.hashbase.io](Archipel: Somoco)*, a project to preserve grassroots history. BERMUDA is based on the [Dat project](https://datproject.org) and is written in JavaScript.

***Warning: Work in progress!** BERMUDA is in active development and still in pre-alpha stage. All kinds of contributions are welcome. See [CONTRIBUTING](#contributing) for details*

## Overview

BERMUDA has a frontend (user interface) and a backend (p2p networking and storage). Currently, it can be run in two ways:

1) **Backend on a server, frontend in a web browser.** All traffic flows from the frontend first to the backend (which can be any computer that is reachable over HTTP) and then from there to other peers in the network. The backend here is a Node.js process. The frontend uses [React](https://reactjs.org/) and runs in any modern web browser, connecting to the backend over HTTP and Websockets.

2) **Standalone desktop app.** Both the backend and the frontend run on your computer. Connections to other peers are direct, with no server in between. It also works in a local network without internet access. The desktop app uses [Electron](https://electronjs.org/), which internally bundles both Node.js and a web browser, [Chromium](https://www.chromium.org/Home). In there, it runs the backend and frontend, whith (nearly) the same code as above. *The Electron app does not run at the moment but will be fixed soon.*

## Installation

There are no packages or binary downloads yet. To install BERMUDA you need [Node.js](https://nodejs.org), [npm](https://npmjs.com) and [git](https://git-scm.com/). Follow the respective installation instructions for your operating system. BERMUDA should run on Linux and Mac, we did not test Windows yet (there might be issues).

In a folder of your choice run the following commands from a terminal to get started (lines starting with # are comments):

```bash
# fetch code
git clone https://github.com/archipel-somoco/archipel
cd archipel

# install dependencies and build frontend assets
npm install
npm run bootstrap
npm run build

# start server and open http://localhost:8080 in a web browser
npm run server 

# or, run the electron app
npm run electron
```

Then open http://localhost:8080 in a modern web browser. As we are in early phases of development, things might not work. Please open issues then.

## Overview

So far, BERMUDA basically is a peer-to-peer shared filesystem (like Dropbox or Google Drive, but completely decentralized). Once you have the app running, you can create *archives*, add files, share these archives with others and give selected people write access.

Each *archive* has a public key, which is its address. The private key, which only the creator of the archive has, gives you write access. You share the public key with anyone to give read access (e.g. by publishing it on a website or by sharing it privately via encrypted email). 

When adding an existing archive (by copying its public key) a new *local key* is created. The original creator of the archive may authorize these local keys to give them write access to the archive.

All this based on the [Dat](https://datproject.org) protocol. Dat is a collection of layered modules that handle finding peers in a decentralized network, creating and repliating append-only logs with cryptographic verification, and combining these append-only logs into multi-writer databases with a filesystem abstraction on top.

*BERMUDA is based on the new, [hyperdb](https://github.com/mafintosh/hyperdb)-based iteration of this stack which is currently in active development within the Dat community. Many existing tools, e.g. the Dat CLI or Beaker Browser, did not yet move to this new stack or are in the process.*

In the future, BERMUDA will not only deal with shared filesystems, but also shared metadata stores, an index and discovery server, and importers for different kinds of content.

## Technical overview



## Roadmap

## Contributing