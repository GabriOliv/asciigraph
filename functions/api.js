const express = require('express');
const serverless = require('serverless-http');
const app = require('../src/app').app;

module.exports.handler = serverless(app);
