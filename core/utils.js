const xlsx = require('xlsx');

/**
 * Converts .xls file to .csv format.
 */
function xlsToCsv(){
    const workBook = xlsx.readFile('data/data.xls');
    xlsx.writeFile(workBook, 'data/output.csv', {bookType: "csv"});
    console.log('Converted .xls to .csv.');
/**
 * Replaces characters in a file
 * @param {*} file          File to replace 
 * @param {*} string        String to replace
 * @param {*} replacement   Replacement string
 */
async function replaceChar(file, string, replacement){
    const regex = new RegExp(string, 'g');
    const options = {
        files: file,
        from: regex,
        to: replacement
    };
    await replace(options, (error, results) => {
        if (error) return console.error('Error occured:', error);

        console.log(`Replaced ${string} with ${replacement}`);
        console.log(results);
    });
}

module.exports = function () {
    this.xlsToCsv = xlsToCsv;
    this.replaceChar = replaceChar;
}