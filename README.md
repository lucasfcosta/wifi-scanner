# wifi-scanner
A command line tool for scanning nearby Wi-Fi networks using Node.js

```
npm install -g wifi-scanner
```


## Instructions

Install `wifi-scanner` globally using `npm install -g wifi-scanner`.
Run `wifi-scanner` with the desired options on your terminal.


## Options

| Short Version Command | Long Version Command | Description |
| --------------------- |--------------------- | ----------- |
| -h | --help                       | output usage information |
| -V | --version                    | output the version number |
| -i | --interface [interfaceName]  | Capture interface. Defaults to 'wlan0'. |
| -s | --stdout                       | (Optional) Print results to the console. |
| -o | --output [filename]          | (Optional) Output filename. |
| -c | --criteria [criteria]          | (Optional) Criteria to filter. Example: 'security'. |
| -f | --filter [result]            | (Optional) Desired result for specified criteria. Example: 'wep'. |
| -r | --retry                      | (Optional) Should retry until it finds a result matching the specified filter. |
| -t | --timeout                    | (Optional) Retry interval (millisseconds). Defaults to 1000. |


## Example Queries

Searches for every WEP network:
```
wifi-scanner -c security -f wep
```

Searches for every WEP network each 5000ms until it finds one.
```
wifi-scanner -r -t 5000 -c security -f wep
```

Gets every nearby network, prints the results to the console and saves them into a networks.json file.
```
wifi-scanner -s -o networks.json
```

Gets every nearby network using the `ath0` interface. 
```
wifi-scanner -i ath0
```


## Criteria

```js
// TODO
```


## Contributing

Feel free to contribute in any way you want. Every help is valid.
If you find any issues or even if you have a suggestion please feel free to report it using our [issue tracker](https://github.com/lucasfcosta/wifi-scanner/issues).

This is the OpenSource Software's magic :sparkles:


## License

[MIT License](https://en.wikipedia.org/wiki/MIT_License)

No need for copyright, live free, buddy, internet is for everyone :wink:
