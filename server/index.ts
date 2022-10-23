import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import bparser from 'body-parser';
import jwt from 'jsonwebtoken';

const { sign } = jwt;

const isDocker = process.env['DOCKER'] !== undefined;
const hostname = isDocker ? 'proxy' : 'localhost';
const origin = isDocker ? 'host.docker.internal' : 'localhost';

const SECRET = '>>=secret=<<';

const app = express();

app.use(cors());
app.use(bparser.json());
app.use(bparser.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log(
    'Server started on port 3000' + (isDocker ? ' (Docker)' : ''),
  );
});

app.post('/token', (req, res) => {
  console.log('------------------------');
  console.log(req.body);
  console.log('------------------------');

  res.send(sign(req.body, SECRET));
});

app.all('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, PUT, PATCH, POST, DELETE',
  );
  res.header(
    'Access-Control-Allow-Headers',
    req.header('access-control-request-headers'),
  );
  const url = `http://${hostname}:80${req.url}`;

  const body =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? JSON.stringify(req.body)
      : undefined;

  fetch(url, {
    origin: `http://${origin}:7575`,
    host: `http://${origin}:7575`,
    method: req.method,
    // @ts-ignore
    headers: req.headers,
    body,
    compress: true,
  })
    .then((r) => r.text())
    .catch((e) => {
      console.log(req.body, e);
      res.status(500);
      return e;
    })
    .then((r) => {
      console.log('-----------------');
      console.log(r);
      console.log('-----------------');

      try {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(r));
      } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        res.send(r);
      }
    });
});
