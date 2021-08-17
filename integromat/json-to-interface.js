/**
 * @file Rough converter from JSON to an Integromat Interface.
 * (Will definitely require editing after!
 * 
 */

const fs = require('fs');

function parseJsonFileFromArgs(){
  const args = process.argv.slice(2);
  const jsonFile = args[0];
  const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  return parsed;
}

/**
 * @typedef {

/**
 * @param {Record<string,any>} parsed JSON object
 * @param {keyof typeof parsed} key
function createInterfaceFromKey(object,key){

}