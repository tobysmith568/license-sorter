# Licence-Sorter [![Build Status](https://dev.azure.com/tobysmith568/License-Sorter/_apis/build/status/tobysmith568.License-Sorter?branchName=master)](https://dev.azure.com/tobysmith568/License-Sorter/_build/latest?definitionId=14&branchName=master)

This CLI takes a JSON file outputted from the NPM library [license-checker](https://www.npmjs.com/package/license-checker) and sorts it so that the results are grouped by their licenses.
<br />
### Eg.
<img src="https://tobysmith568.github.io/License-Sorter/before-and-after-labelled.png" />
<br />

## Installation and Usage (CLI)
```
$ npm install license-sorter -g

$ license-sorter --input licenses.json --output licenses-sorted.json
```
- Input: The file to be converted
- Output: The file to be created

If either flag is omitted the CLI will prompt you for the inputs.

If you don't supply an input file, and the CLI is able to detect a package.json file, the it will allow you to run the command using dependencies it detects in the local project.

## Installation and Usage (Programmatic use)
```
$ npm install license-sorter
```
```js
const licenseSorter = require("license-sorter");

licenseSorter.convertFile("licenses.json", "licenses-sorted.json")
.then(() => {

})
.catch(() => {

});
```
```ts
import * as licenseSorter from "license-sorter";

await licenseSorter.convertFile("licenses.json", "licenses-sorted.json");
```

This library is in no way affiliated with [license-checker](https://www.npmjs.com/package/license-checker).
