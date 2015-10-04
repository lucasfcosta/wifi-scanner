#! /usr/bin/env node

'use strict';
const program = require('commander');
const iwlist = require('wireless-tools/iwlist');
const chalk = require('chalk');
const fs = require('fs');

program
  .version('0.0.1')
  .option('-i, --interface [interfaceName]', 'Capture interface. Defaults to \'wlan0\'.')
  .option('-p, --print', '(Optional) Print results to the console.')
  .option('-o, --output [filename]', '(Optional) Output filename.')
  .option('-c --criteria [criteria]', '(Optional) Criteria to filter. Example: \'security\'.')
  .option('-f, --filter [result]', '(Optional) Desired result for specified criteria. Example: \'wep\'.')
  .option('-s, --sortCriteria [criteria]', '(Optional) Sort results according to a specified criteria.')
  .option('-a, --ascending', '(Optional) Sort results ascendingly. (DEFAULT)')
  .option('-d, --descending', '(Optional) Sort results descendingly.')
  .option('-r, --retry', '(Optional) Should retry until it finds a result matching the specified filter.')
  .option('-t, --timeout' ,'(Optional) Retry interval (millisseconds). Defaults to 1000.')
  .parse(process.argv);

let filename = program.output;
let cInterface = program.interface || 'wlan0';
let filter = program.filter;
let criteria = program.criteria;
let shouldUseConsole = program.print || false;
let shouldRetry = program.retry || false;
let timeout = Number(program.timeout) || 1000;
let sortCriteria = program.sortCriteria;
let ascending = program.ascending || true;
let descending = program.descending || false;

function searchNetworks(callback) {
  console.log(chalk.yellow('Scanning...'));

  iwlist.scan(cInterface, (err, networks) => {
    if (!err) console.log(chalk.green('Finished scanning nearby networks.'));
    callback(err, networks)
  });
}

function sortNetworks(networks) {
  function compare(a, b) {
    if (a[sortCriteria] < b[sortCriteria])
      return -1;
    if (a[sortCriteria] > b[sortCriteria])
      return 1;
    return 0;
  }

  return networks.sort(compare);
}

function filterNetworks(networks) {
  let results = networks;

  if (criteria && filter) {
    results.filter((network) => {
      if (network[criteria] + '' === filter) {
        return true;
      }
    });
  }

  if (sortCriteria) {
    results = sortNetworks(results);
    if (descending) {
      results = results.reverse();
    }
  }

  return results;
}

function search(retryCount) {
  searchNetworks((err, networks) => {
    if (err) {
      console.log(chalk.bgRed(err));
    } else {
      let filteredNetworks = filterNetworks(networks);
      let resultString = JSON.stringify(filteredNetworks, null, 2);

      if (filteredNetworks.length === 0) {
        console.log(chalk.yellow('No networks found matching the filter: ' + criteria + ' = ' + filter));

        if(shouldRetry) {
          setTimeout(() => {
            console.log(chalk.yellow('Retrying. ('+ retryCount + ')\n'));
            search(retryCount + 1);
          }, timeout);
        }
      } else {
        if(filteredNetworks.length > 0 && filename !== undefined) {
          fs.writeFile(filename, resultString, () => {
            console.log(chalk.green('Nearby networks saved at: ' + filename));
          });
        }

        if (shouldUseConsole) {
          console.log(chalk.cyan(resultString));
        }

        if (criteria !== undefined && filter !== undefined) {
          console.log(chalk.bgGreen.white('Found ' + filteredNetworks.length + ' networks matching the filter: ' + criteria + ' = ' + filter));
        } else {
          console.log(chalk.bgGreen.white('Found ' + filteredNetworks.length + ' network(s).'));
        }
      }
    }
  });
}

search(0);
