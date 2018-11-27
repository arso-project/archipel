# archipel-app

*archipel* is a decentralized archiving and media library system. It's the centerpiece of [*Archipel: Somoco*](https://archipel.hashbase.io), a project to preserve grassroots history. *archipel* is based on the [Dat project](https://datproject.org) and is written in JavaScript.

***Warning: Work in progress!** *archipel* is in active development and still in pre-alpha stage. All kinds of contributions are welcome. See [CONTRIBUTING](#contributing) for details*

## Overview

So far, *archipel* basically is a peer-to-peer shared filesystem (like Dropbox or Google Drive, but completely decentralized). Once you have the app running, you can create *archives*, add files, share these archives with others and give selected people write access.

Each *archive* has a public key, which is its address. The private key, which only the creator of the archive has, gives you write access. You share the public key with anyone to give read access (e.g. by publishing it on a website or by sharing it privately via encrypted email).

When adding an existing archive (by copying its public key) a new *local key* is created. The original creator of the archive may authorize these local keys to give them write access to the archive.

*archipel* has a frontend (user interface) and a backend (p2p networking and storage). Currently, it can be run in two ways:

1) **Backend on a server, frontend in a web browser.** All traffic flows from the frontend first to the backend (which can be any computer that is reachable over HTTP) and then from there to other peers in the network. The backend here is a Node.js process. The frontend uses [React](https://reactjs.org/) and runs in any modern web browser, connecting to the backend over HTTP and Websockets.

2) **Standalone desktop app.** Both the backend and the frontend run on your computer. Connections to other peers are direct, with no server in between. It also works in a local network without internet access. The desktop app uses [Electron](https://electronjs.org/), which internally bundles both Node.js and a web browser, [Chromium](https://www.chromium.org/Home). In there, it runs the backend and frontend, whith (nearly) the same code as above. *The Electron app does not run at the moment but will be fixed soon.*

In the future, *archipel* will not only deal with shared filesystems, but also shared metadata stores, an index and discovery server, and importers for different kinds of content.

## Installation

There are no packages or binary downloads yet. To install *archipel* you need [Node.js](https://nodejs.org), [npm](https://npmjs.com) and [git](https://git-scm.com/). Follow the respective installation instructions for your operating system. *archipel* should run on Linux and Mac, we did not test Windows yet (there might be issues).

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

## Technical overview

*TODO*

All this is based on the [Dat](https://datproject.org) protocol. Dat is a collection of layered modules that handle finding peers in a decentralized network, creating and replicating append-only logs with cryptographic verification, and combining these append-only logs into multi-writer databases with a filesystem abstraction on top.

**archipel* is based on the new, [hyperdb](https://github.com/mafintosh/hyperdb)-based iteration of this stack which is currently in active development within the Dat community. Many existing tools, e.g. the Dat CLI or Beaker Browser, did not yet move to this new stack or are in the process.*

For now, a list of the more important dependencies used in *archipel*:

**Backend**:

- [hyperdrive](https://github.com/jimpick/hyperdrive) (branch multiwriter-staging)
- [hyperdb](https://github.com/mafintosh/hyperdb)

**Frontend**:

- [React](https://reactjs.org)

**Frontend and backend**:

- [ucore](https://github.com/Frando/ucore)
- [hyperpc](https://github.com/frando/hyperpc)

## Roadmap

*TODO!*

- Milestone 35C3 (end of december 18): A functional peer-to-peer "dropbox"
- Milestone Content Week (end of january): Basic metadata handling and importing
- Milestone Prototype Fund Demoday (end of february): Testing, polishing. Release beta1.

## Contributing

Code is GPLv3. All contributions are welcome. Open issues here. More detailed documentation on what goes where and how to setup a dev environment will follow soon. You can also reach out to us via IRC in #dat on freenode, or at archipel@riseup.net via email.
