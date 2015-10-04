#! /usr/bin/env node

'use strict';
const program = require('commander');
const iwlist = require('wireless-tools/iwlist');
const chalk = require('chalk');
const fs = require('fs');

program
  .version('0.0.1')
  .option('-i, --interface [interfaceName]', 'Capture interface. Defaults to \'wlan0\'.')
  .option('-s --stdout', '(Optional) Print results to the console.')
  .option('-o, --output [filename]', '(Optional) Output filename.')
  .option('-c --criteria [criteria]', '(Optional) Criteria to filter. Example: \'security\'.')
  .option('-f, --filter [result]', '(Optional) Desired result for specified criteria. Example: \'wep\'.')
  .option('-a, --above [value]', '(Optional) Filters values above [value] for a specified criteria.')
  .option('-b, --below [value]', '(Optional) Filters values below [value] for a specified criteria.')
  .option('-r, --retry', '(Optional) Should retry until it finds a result matching the specified filter.')
  .option('-t, --timeout' ,'(Optional) Retry interval (millisseconds). Defaults to 1000.')
  .parse(process.argv);

let filename = program.output;
let cInterface = program.interface || 'wlan0';
let filter = program.filter;
let criteria = program.criteria;
let shouldUseConsole = program.stdout || false;
let above = Number(program.above);
let below = Number(program.below);
let shouldRetry = program.retry || false;
let timeout = Number(program.timeout) || 1000;

function searchNetworks(callback) {
  console.log(chalk.yellow('Scanning...'));

  iwlist.scan(cInterface, (err, networks) => {
    if (!err) console.log(chalk.green('Finished scanning nearby networks.'));
    callback(err, networks)
  });
}

function filterNetworks(networks) {
  // If there is no filter specified it returns every network
  let results = networks;

  if (criteria && filter) {
    results = results.filter((network) => {
      if (network[criteria] + '' === filter) {
        return true;
      }
    });
  }

  // Filters above/below values if these parameters exist
  if (criteria && above) {
    results = results.filter((network) => {
      if (Number(network[criteria]) > above) {
        return true;
      }
    });
  } else if (criteria && below) {
    results = results.filter((network) => {
      if (Number(network[criteria]) < below) {
        return true;
      }
    });
  }

  return results;
}

function createFilterString() {
  var filterString = '';

  if (filter) {
    filterString += criteria + ' = ' + filter;
  }
  if (above) {
    filterString += criteria + ' > ' + above;
  }
  if (below && above) {
    filterString += ' && '
  }
  if (below) {
    filterString += criteria + ' < ' + below;
  }

  return filterString;
}

function search(retryCount) {
  searchNetworks((err, networks) => {
    if (err) {
      console.log(chalk.bgRed(err));
    } else {
      let filteredNetworks = filterNetworks(networks);
      let resultString = JSON.stringify(filteredNetworks, null, 2);

      if (filteredNetworks.length === 0) {
        console.log(chalk.yellow('No networks found matching the filter: ' + createFilterString()));

        if(shouldRetry) {
          setTimeout(() => {
            console.log(chalk.yellow('Retrying. ('+ retryCount + ')\n'));
            search(retryCount + 1);
          }, timeout);
        }
      } else {
        if(filteredNetworks.length > 0 && filename) {
          fs.writeFile(filename, resultString, () => {
            console.log(chalk.green('Nearby networks saved at: ' + filename));
          });
        }

        if (shouldUseConsole) {
          console.log(chalk.cyan(resultString));
        }

        var feedbackString = chalk.bgGreen.white('Found ' + filteredNetworks.length + ' network(s) matching the filter: '+ createFilterString());
        console.log(feedbackString);
      }
    }
  });
}

search(0);
