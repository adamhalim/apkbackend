const xlsx = require('xlsx');

function xlsToCsv(){
    const workBook = xlsx.readFile('data/data.xls');
    xlsx.writeFile(workBook, 'data/output.csv', {bookType: "csv"});
    console.log('Converted .xls to .csv.');
}

module.exports = function () {
    this.xlsToCsv = xlsToCsv;
}