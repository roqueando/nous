<div align="center">
  <img alt="Version" src="logo.svg" alt="nous logo" width="20%">
</div>

<h1 align="center">
  bienvenue 👋
</h1>
<p>
  <a href="https://www.npmjs.com/package/@roqueando/nous" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/@roqueando/nous.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/rockroqueando" target="_blank">
    <img alt="Twitter: rockroqueando" src="https://img.shields.io/twitter/follow/rockroqueando.svg?style=social" />
  </a>
</p>

> Un orchestre parmi nous

## Install

```sh
yarn install
npm install
```

## Usage

```javascript
const {Manager} = require('@roqueando/nous');
const fs = require('fs');

const manager = new Manager(8080);
manager.run(); // a new server is running in port 8080 waiting for services and messages
console.log('Manager running on 8080');

// for multiple services
const files = fs.readdirSync('./services'); // assuming if services folder is in root path
files.forEach((file) => {
    const service = require(`./services/${file}`);
    const newService = new service();
    newService.setName('nameForService');
    newService.run(); // this will register on Manager and be ready for receive messages.
    console.log(`Running ${newService.name} at ${newService.port}`);
});

// for one service
const service = require('./services/service.js');
const newService = new service();
service.setName('aServiceName');
service.run();
```




## Run tests

```sh
yarn test
```



## API

### Manager

`new Manager` a new instance to manager server, which one can receive messages, actions and distribute to all other services

### Service

`new Service` anything that is extended as Service, will be a server with your business logic in TCP or HTTP connection.

Services can communicate with Manager and other services via TCP, and can be HTTP or TCP node.

### Router

`new Router` a router its only for HTTP services, that can up routes and handlers for service like a "express" app.

### Client

`new Client` a client to connect to manager and send actions and receive data. Can be used in front too.

### Token

`new Token` a JWT Token generator.

## Authors

👤 **roqueando**

* Twitter: [@rockroqueando](https://twitter.com/rockroqueando)
* Github: [@roqueando](https://github.com/roqueando)

👤 **christopy**

* Github: [@christopy](https://github.com/christopy)

## 

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/roqueando/nous/issues). 

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
