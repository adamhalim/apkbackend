const mysql = require('mysql');
const fs = require('fs');
const fastcsv = require('fast-csv');

require('dotenv').config();

// Creates a connection to MySQL db
var con = mysql.createPool({
    host: '192.168.1.227',
    user: 'apk',
    password: process.env.MYSQL_PASSWORD,
    database: 'apk',
    connectionLimit: 100
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
            // | apk      | decimal(10,3) | YES  |     | NULL    |       |  (7  *2 ) / 5
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
            con.connect((err) => {
                if (err) throw err;
                console.log('Connected to MySQL');
                let query =  `INSERT INTO beverages (nr, namn, namn2, price, volume, alcohol, category, apk) VALUES ?`;
                con.query(query, [JSONarray], (err, res) => {
                    if (err) throw err;
                    console.log('Successfully inserted into MySQL');
                });
            });
        });
        stream.pipe(csvStream);
}

/**
 * Returns a range of beverages from database, matching a category, ordered by apk descending.
 * @param {Integer} lower   Lower range
 * @param {Integer} upper   Upper range
 * @param {String} category Category
 */
async function selRangeCategory(lower, upper, category) {
    return new Promise((resolve, reject) => {

        category = category.toLowerCase();

        con.getConnection((err) => {
            if (err) throw err;
            console.log('Connected to MySQL');
            let query = `SELECT * FROM beverages WHERE category = '${category}' ORDER BY apk DESC LIMIT ${lower}, ${upper}`;
            con.query(query, (err, res) => {
                if (err) reject(err);
                console.log( err || res);
                resolve(res);
            });
        });
    }); 
}

module.exports = function () {
    this.parseCsvToMySQL = parseCsvToMySQL;
    this.selRangeCategory = selRangeCategory;
}