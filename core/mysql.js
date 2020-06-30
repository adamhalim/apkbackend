const mysql = require('mysql');
const fs = require('fs');
const fastcsv = require('fast-csv');
const editJsonFile = require('edit-json-file');

require('dotenv').config();

// Creates a connection to MySQL db
var con = mysql.createPool({
    host: '192.168.1.227',
    user: 'apk',
    password: process.env.MYSQL_PASSWORD,
    database: 'apk',
    connectionLimit: 100
});

const counters = editJsonFile('./data/counters.json', {
    autosave: true
});

/**
 * Parses entire .csv file and inserts data into MySQL database.
 */
function parseCsvToMySQL(){
    let stream = fs.createReadStream('data/output.csv');
    let JSONarray = [];
    let csvStream = fastcsv
        .parse()
        .on('data', function(data) {
            // csv structure:
            // 0 nr, 1 ID, 2 VaruNR, 3 Namn, 4 Namn2, 5 Pris, 6 pant, 7 Volym, 8 Pris/liter, 9 säljstart, 10 utgått, 
            // 11 Varugrupp, 12 Typ, 13 stil, 14 förpackning, 15 förslutning,  16 ursprung, 17  land, 18 producent, 19 leverantör, 20 årgång
            // 21 idk, 22 alkhalt, 23 sortiment, 24  sortimentText, 25 ekologiskt, 26 etisk, 27 etiskEtikett, 28  koscher, 29 råvarorbeskrivning
            // 30 APK (custom)

            // SQL Table structure:
            // +----------+---------------+------+-----+---------+-------+
            // | Field    | Type          | Null | Key | Default | Extra |
            // +----------+---------------+------+-----+---------+-------+
            // | nr       | int           | NO   | PRI | NULL    |       |  0
            // | namn     | varchar(100)  | YES  |     | NULL    |       |  3
            // | namn2    | varchar(100)  | YES  |     | NULL    |       |  4
            // | price    | decimal(48,2) | YES  |     | NULL    |       |  5
            // | volume   | smallint      | YES  |     | NULL    |       |  7
            // | alcohol  | decimal(10,3) | YES  |     | NULL    |       |  22
            // | category | varchar(100)  | YES  |     | NULL    |       |  11
            // | apk      | decimal(10,3) | YES  |     | NULL    |       |  (7  * 22) / 5
            // +----------+---------------+------+-----+---------+-------+

                    
            // Array with correct SQL structure, if volume = 0, sets alcohol to NLUL instead of dividing by 0...
           if(data[7] == 0){
               JSONarray.push([parseInt(data[0]), `${data[3]}`, `${data[4]}`, parseFloat(data[5]), parseInt(data[7]), null, `${data[11]}`, (((parseFloat(data[7]) * data[22]) / parseFloat(data[5]))).toFixed(3)]);
           } else {
            JSONarray.push([parseInt(data[0]), `${data[3]}`, `${data[4]}`, parseFloat(data[5]), parseInt(data[7]), parseFloat(data[22]), `${data[11]}`, (((parseFloat(data[7]) * data[22]) / parseFloat(data[5]))).toFixed(3)]);
           }
        })
        .on('end', function() {
            // Remove the first line (header)
            JSONarray.shift();

            // Query to INSERT entire array of data
            con.getConnection((err) => {
                if (err) throw err;
                console.log('Connected to MySQL');
                let query =  `INSERT INTO beverages (nr, namn, namn2, price, volume, alcohol, category, apk) VALUES ?`;
                con.query(query, [JSONarray], (err, res) => {
                    if (err) throw err;
                    console.log('Successfully inserted into MySQL');
                    updateCounters();
                });
            });
        });
        stream.pipe(csvStream);
}

/**
 * For each category in the database, update the amonut of items 
 * in each category.z
 */
function updateCounters() {
    let data = require('../data/counters.json');
    for(const count in data){
        let query = `SELECT COUNT(*) FROM beverages WHERE category=\'${count}\'`;
        con.getConnection((err) => {
            if (err) throw err;
            con.query(query, (err, res) => {
                if(err) throw err;
                counters.set(count, res[0]['COUNT(*)']);
            });
        });
        counters.set(count, 5);
    }
    console.log('Updated counters');

}

/**
 * Returns a range of beverages from database, matching a category, ordered by apk descending.
 * @param {Integer} lower   Lower range
 * @param {Integer} upper   Upper range
 * @param {String} category Category, pass null if no category
 */
function selRangeCategory(lower, upper, category) {
    return new Promise((resolve, reject) => {
        con.getConnection((err) => {
            if (err) throw err;
            console.log('Connected to MySQL');
            let query = '';
            if(category != null){
                category = category.toLowerCase();
                query = `SELECT * FROM beverages WHERE category = '${category}' ORDER BY apk DESC LIMIT ${lower}, ${upper}`;
            } else {
                query = `SELECT * FROM beverages ORDER BY apk DESC LIMIT ${lower}, ${upper}`;
            }            
            con.query(query, (err, res) => {
                if (err) {
                    reject(err);
                    console.log(err);
                }
                
                if(objIsEmpty(res)) {
                    //reject(('No entires found.'));
                    reject(new Error('No entires found.'));
                } else {
                    resolve(res);
                }
            });
        });
    }); 
}

/**
 * Returns a page with beverages; a page 
 * is 10 beverages.
 * @param {Integer} pageNum 
 * @param {String} category 
 */
async function getPage(pageNum, category) {
    let upper = PAGE_SIZE;
    let lower = pageNum * PAGE_SIZE;

    if(pageNum < 0 || pageNum > maxPage(category)) {
        return new Error(`Please enter a page between 0 and ${maxPage(category)}`);
    }

    if(pageNum = maxPage(category)) {
        console.log(counters.get(category) % PAGE_SIZE);
        upper = counters.get(category) % PAGE_SIZE;
    }
    return await selRangeCategory(lower, upper, category);
}


module.exports = function () {
    this.parseCsvToMySQL = parseCsvToMySQL;
    this.selRangeCategory = selRangeCategory;
    this.updateCounters = updateCounters;
    this.getPage = getPage;
}