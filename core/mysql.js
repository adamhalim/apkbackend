const mysql = require('mysql');
const fs = require('fs');
const fastcsv = require('fast-csv');

require('dotenv').config();

// Creates a connection to MySQL db
var con = mysql.createConnection({
    host: '192.168.1.227',
    user: 'apk',
    password: process.env.MYSQL_PASSWORD,
    database: 'apk'
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

            // Columns needed for link-builder later: 0 (nr), 3 (namn), 11 (varugrupp)

            // SQL Table structure:
            // +----+------+-------+-------+--------+-----+
            // | nr | namn | namn2 | price | volume | apk |
            // +----+------+-------+-------+--------+-----+
                    
            // Adds another column for APK
            // Array with correct SQL structure
            JSONarray.push([parseInt(data[0]), `${data[3]}`, `${data[4]}`, parseInt(data[5]), parseInt(data[7]),0.543]);
        })
        .on('end', function() {
            // Remove the first line (header)
            JSONarray.shift();

            // Query to INSERT entire array of data
            con.connect((err) => {
                if (err) throw err;
                console.log('Connected to MySQL.testData');
                let query =  `INSERT INTO drinks (nr, name, name2, price, volume, apk) VALUES ?`;
                con.query(query, [JSONarray], (err, res) => {
                    console.log(err || res);
                });
            });
        });
        stream.pipe(csvStream);
}

module.exports = function () {
    this.parseCsvToMySQL = parseCsvToMySQL;    
}