# Back-end for APK app

## Plans:

* Read XLS data ✓
    * Parse XLS to CSV ✓
* Save XLS data to database
    * Update database   ✓
    * Retrieve data from database
    * Find changes when downloading from Systembolaget

* Write API to
    * Retrieve data from database
        * Do stuff with data (sort/find etc.)

## Routes:

### GET /beverages/

Runs `selRangeCategory()` and returns the result of the function. The function takes
a lower limit, an upper limit and a category to query the database and returns data ordered 
by apk descending matching the specified category.

Example body: 

```json
lower: 0,
upper: 2,
category: 'Whisky'
```

Example response:

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