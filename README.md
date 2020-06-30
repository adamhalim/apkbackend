# Back-end for APK app

## Plans:

* Read XLS data ✓
    * Parse XLS to CSV ✓
* Save XLS data to database
    * Update database   ✓
    * Retrieve data from database ✓
    * Find changes when downloading from Systembolaget

* Write API to
    * Retrieve data from database ✓
        * Do stuff with data (sort/find etc.)

## Routes:

### GET /beverages/


Runs `selRangeCategory()` and returns the result of the function. The function takes
a lower limit, an upper limit and a category to query the database and returns data ordered 
by apk descending matching the specified category.

<details>

<summary>Example:</summary>

Body: 

```json
lower: 0,
upper: 2,
category: 'Whisky'
```

Response:

```json
[ RowDataPacket {
    nr: 48401,
    namn: 'The Talisman',
    namn2: ' ',
    price: 217,
    volume: 700,
    alcohol: 0.4,
    category: 'Whisky',
    apk: 1.29 },
  RowDataPacket {
    nr: 2044401,
    namn: 'High Commissioner',
    namn2: ' ',
    price: 217,
    volume: 700,
    alcohol: 0.4,
    category: 'Whisky',
    apk: 1.29 } ]
```
</details>

### GET /page/

Runs `getPage(pageNum, category)` and returns the result of the function.

<details>

<summary>Example:</summary>

Body: 

```json
pageNum: 5
category: 'Whisky'
```

Response:

```json
{ success: true,
  body:
   [ { nr: 8537001,
       namn: 'Cutty Sark',
       namn2: 'Prohibition',
       price: 329,
       volume: 700,
       alcohol: 0.5,
       category: 'Whisky',
       apk: 1.064 },
     { nr: 49301,
       namn: 'Johnnie Walker',
       namn2: 'Red Label',
       price: 264,
       volume: 700,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.061 },
     { nr: 43808,
       namn: 'The Famous Grouse',
       namn2: ' ',
       price: 1699,
       volume: 4500,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.059 },
     { nr: 49201,
       namn: 'Clontarf',
       namn2: 'Classic Blend',
       price: 265,
       volume: 700,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.057 },
     { nr: 8772705,
       namn: 'The Famous Grouse',
       namn2: ' ',
       price: 669,
       volume: 1750,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.046 },
     { nr: 8531002,
       namn: 'Cutty Sark',
       namn2: ' ',
       price: 135,
       volume: 350,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.037 },
     { nr: 45902,
       namn: 'Lauder\'s',
       namn2: ' ',
       price: 135,
       volume: 350,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.037 },
     { nr: 1014402,
       namn: 'John Lee',
       namn2: ' ',
       price: 135,
       volume: 350,
       alcohol: 0.4,
       category: 'Whisky',
       apk: 1.037 } ] }
```

</details>