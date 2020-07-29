const xlsx = require('xlsx');
const fs = require('fs').promises;
const replace = require('replace-in-file');
const { writeFile, readFile } = require('fs');
const Entities = require('html-entities').XmlEntities;
var accents = require('remove-accents');
const editJsonFile = require('edit-json-file');

global.PAGE_SIZE = 10;

const counters = editJsonFile('./data/counters.json', {
    autosave: true
});

/**
 * Converts .xls file to .csv format.
 * This will read from data/data.xls and use the xlsx module
 * to convert it to .csv. The output file will be stored in data/output.csv
 */
async function xlsToCsv(){
    const workBook = await xlsx.readFile('data/data.xls');
    await xlsx.writeFile(workBook, 'data/output.csv', {bookType: "csv"});
    console.log('Converted .xls to .csv.');

    // Somwhere along the way some characters get HTML encoding. 
    // This seems to be from the xlsx module. So when the output file 
    // is done, this will run a html decoderr that replaces all HTML 
    // ascii values with their real values
    await fs.writeFile('data/output.csv', htmlDecoder(await fs.readFile('data/output.csv', 'utf8')), (err) => {
        if (err) throw err;
    });
}

/**
 * Replaces all HTML ascii values with their real values.
 * Uses the html-entities module.
 * @param {File} file 
 */
function htmlDecoder(file){
    const entities = new Entities();
    console.log('Done converting html');
    return entities.decode(file);
}

/**
 * Replaces characters in a file.
 * Uses the replace-in-file module. 
 * Currently not used anywhere.
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
    });
}

/**
 * Translates a category from the database to the correct category 
 * on Systembolaget's website. Used to build correct links.
 * @param {String} category  Category to translate
 */
function categoryTranslator(category){
    sprit = ["Vodka och Brännvin", "Akvavit och Kryddat brännvin", "Tequila och Mezcal", "Smaksatt sprit", "Gin och Genever", "Calvados",
     "Anissprit", "Cognac", "Rom", "Drinkar och Cocktails", "Grappa och Marc", "Frukt och Druvsprit", "Punsch", "Likör", "Whisky", "Armagnac och Brandy",
    "Bitter", "Sprit av flera typer"]
    apertif = ["Sake", "Aperitif och dessert", "Glögg och Glühwein", "Blå stilla", "Blå mousserande", "Vermouth", "Blandlådor vin"];
    roseviner = ["Rosévin", "Rosé - lägre alkoholhalt"];
    presentartiklar = ["Presentförpackningar", "Dryckestillbehör"];
    vita_viner = ["Vitt vin", "Vita - lägre alkoholhalt"];
    //ol = ["&#214;l"];
    cider_och_blandrycker = ["Cider", "Blanddrycker"];
    //alkoholfritt = ["Alkoholfritt"];
    roda_viner = ["Rött vin", "Röda - lägre alkoholhalt"];
    mousserande_viner = ["Mousserande vin"];

    if(sprit.includes(category)) return "sprit";
    if(apertif.includes(category)) return "aperitif-dessert";
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
 * Replaces unwanted characters for the link builder
 * (Needs more testning, most likely more invalid characters) 
 * So far, these characters have been found to be invalid: { '&', '\', ' ' }
 * @param {String} string 
 */
function charReplaceLink(string){
    string = string.replace('&', '');
    string = string.replace('\'', '');
    return string.replace('  ', ' ');
}

/**
 * Creates a link to Systembolaget based on the drink.
 * Currently takes JSON and only makes one link.
 * 
 * The way Systembolaget structure their links is
 * https://systembolaget.se/dryck/${category}/${name}-${nr},
 * where the spaces in the name get replaced with a dash (-) 
 * and some special characters get removed, such as & and '.
 * @param {Object} drink Drink you want a link to.
 */
async function linkBuilder(drink) {
    let namn = drink.namn;
    let namn2 = drink.namn2;

    // Certain characters are removed from 
    // drink's names from the URL on Systembolaget. 
    // This will run a function that remove these 
    // characters from the link.
    namn = charReplaceLink(namn);
    namn = namn.split(" ");
    namn2 = charReplaceLink(namn2);
    namn2 = namn.split(" ");

    if(typeof categoryTranslator(drink.category) == 'undefined') {
        throw new Error('Category is undefined.');
    }
    

    let link = `https://systembolaget.se/dryck/${categoryTranslator(drink.category)}/`;

    // We now have the base URL for the drink. We only need to add '${name}-${nr}'
    // If a drink has a name with multiple words, for example Norrlands Guld, the 
    // URL for it will be '.../norrlands-guld-nr'. That's why we split the name earlier 
    // at each whitespace and now iterate through each substring, adding a dash between each
    // word.
    for(str of namn) {
        link += `${str}-`
    }

    if(namn2 == ""){
        for(str in namn2) {
            link += `${str}-`
        }
    }
        link += drink.nr;
    return accents.remove(link);
    
}

/**
 * Checks if object is empty. 
 * More readable than using the 
 * actual code itself.
 * @param {Object} object 
 */
function objIsEmpty(object) {
    return !Object.keys(object).length;
}

/**
 * Returns the maximum amount of page 
 * for the given category.
 * @param {String} category 
 */
function maxPage(category) {
    let data = require('../data/counters.json');

    // This will check through all the categories counters
    // in data/counters.json. If the matching category is found,
    // it will divide the counter by the defined PAGE_SIZE and round it
    // up to an even integer and subtract one. This will give us 
    // how many pages we can use to fit all the beverages 
    // in a given category.
    for(const count in data) {
        if (count == category) {
            // TODO: This will return 0 if the counter is smaller 
            // than 11. It should return 1.
            return (Math.ceil((counters.get(count)) / PAGE_SIZE) - 1);
        }
    }
    return new Error('Category not found');
}

module.exports = function () {
    this.xlsToCsv = xlsToCsv;
    this.replaceChar = replaceChar;
    this.categoryTranslator = categoryTranslator;
    this.linkBuilder = linkBuilder;
    this.htmlDecoder = htmlDecoder;
    this.objIsEmpty = objIsEmpty;
    this.maxPage = maxPage;
}