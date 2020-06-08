const express = require('express');

require('./core/utils.js')();

const app = express();

const server = app.listen(3000, () => {
    const host  = '0.0.0.0';
    const port = 3000;
    console.log(`Roomie listening on http://${host}:${port}`);
});

