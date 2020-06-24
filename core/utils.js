const xlsx = require('xlsx');
const fs = require('fs').promises;
const replace = require('replace-in-file');
const { writeFile, readFile } = require('fs');
const Entities = require('html-entities').XmlEntities;
var accents = require('remove-accents');

/**
 * Converts .xls file to .csv format.
 */
async function xlsToCsv(){
    const workBook = await xlsx.readFile('data/data.xls');
    await xlsx.writeFile(workBook, 'data/output.csv', {bookType: "csv"});
    console.log('Converted .xls to .csv.');

    // Replaces all HTML ascii values with their real values
    await fs.writeFile('data/output.csv', htmlDecoder(await fs.readFile('data/output1.csv', 'utf8')), (err) => {
        if (err) throw err;
    });
}

function htmlDecoder(file){
    const entities = new Entities();

    console.log('Done converting html');
    return entities.decode(file);
}

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

/**
 * Translates a category from the database to the correct category 
 * on Systembolaget's website. Used to build correct links.
 * @param {String} category  Category to translate
 */
function categoryTranslator(category){
    sprit = ["Vodka och Brännvin", "Akvavit och Kryddat brännvin", "Tequila och Mezcal", "Smaksatt sprit", "Gin och Genever", "Calvados",
     "Anissprit", "Cognac", "Rom", "Drinkar och cocktails", "Grappa och marc", "Frukt och druvsprit", "Punsch", "Likör", "Whisky", "Armagnac och brandy",
    "Bitter", "Sprit av flera typer"]
    apertif = ["Sake", "Apertif och dessert", "Glögg och Glühwein", "Blå stilla", "Blå mousserande", "Vermouth", "Blandlådor vin"];
    roseviner = ["Rosévin", "Rosé; - lägre alkoholhalt"];
    presentartiklar = ["Presentförpackningar", "Dryckestillbehör"];
    vita_viner = ["Vitt vin", "Vita - lägre alkoholhalt"];
    //ol = ["&#214;l"];
    cider_och_blandrycker = ["Cider", "Blanddrycker"];
    //alkoholfritt = ["Alkoholfritt"];
    roda_viner = ["Rött vin", "Röda - lägre alkoholhalt"];
    mousserande_viner = ["Mousserande vin"];

    if(sprit.includes(category)) return "sprit";
    if(apertif.includes(category)) return "apertif";
    if(roseviner.includes(category)) return "roseviner";
    if(presentartiklar.includes(category)) return "presentartiklar";
    if(vita_viner.includes(category)) return "vita-viner";
    if(category == "Öl") return "ol";
    if(cider_och_blandrycker.includes(category)) return "cider-och-blanddrycker";
    if(category == "Alkoholfritt") return "alkoholfritt";
    if(roda_viner.includes(category)) return "roda-viner";
    if(mousserande_viner.includes(category)) return "mousserande-viner";
}

/**
 * Creates a link to Systembolaget based on the drink
 * @param {Object} drink Drink you want a link to.
 */
function linkBuilder(drink) {
    let namn = drink[0].namn;
    let namn2 = drink[0].namn2;

    namn = namn.split(" ");
    
    let link = `https://systembolaget.se/dryck/${categoryTranslator(drink[0].category)}/`;

    for(str of namn) {
        link += `${str}-`
    }

    if(namn2 == ""){
        for(str in namn2) {
            link += `${str}-`
        }
    }
        link += drink[0].nr;
     
    return accents.remove(link);
}

module.exports = function () {
    this.xlsToCsv = xlsToCsv;
    this.replaceChar = replaceChar;
    this.categoryTranslator = categoryTranslator;
    this.linkBuilder = linkBuilder;
    this.htmlDecoder = htmlDecoder;
}