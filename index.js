const express = require('express');
const {body, validationResult} = require('express-validator');

require('./core/utils.js')();
require('./core/mysql.js')();

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
    const host  = '0.0.0.0';
    const port = 3000;
    console.log(`Roomie listening on http://${host}:${port}`);
});

// Routes
app.get('/beverages/',[
    body('lower').isInt(),
    body('upper').isInt(),
    body('category').isString()
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json
        return res.status(422).json({success: false, errors: errors.array()});
    }
    selRangeCategory(req.body.lower, req.body.upper, req.body.category)
        .then((data) => {            
            return res.send({success: true, body: data});
        })
        .catch((err) => {
            return res.json({success: false, errors: `${err}`})
    });
});

app.get('/page/', [
    body('pageNum').isInt(),
    body('category').isString()

], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json
        return res.status(422).json({success: false, errors: errors.array()});
    }
    getPage(req.body.pageNum, req.body.category)
        .then((data) => {
            return res.send({success: true, body: data});
        })
        .catch((err) => {
            return res.json({success: false, errors: `${err}`})
    });
});