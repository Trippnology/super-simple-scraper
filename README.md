# Super Simple Scraper

A simple command-line tool for scraping HTML content from a given URL and extracting data based on specified options.

## Installation

To install the `super-simple-scraper`, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/trippnology/super-simple-scraper.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd super-simple-scraper
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Make the script executable (optional, for Unix-based systems):**

    ```bash
    chmod +x index.js
    ```

## Usage

You can run the scraper using the following command:

```bash
node index.js [options]
```

### Options

- `-u, --url <url>`: The URL to scrape. Default is `https://weather.trippnology.com`.
- `-s, --selector <selector>`: jQuery selector to return. Default is `a`.
- `-f, --format <format>`: Output format (`hash`, `html`, `json`, `link`, `object`, or `text`). Default is `link`.

### Examples

1. **Scrape a specific URL with default options:**

    ```bash
    node index.js -u https://example.com
    ```

2. **Scrape a URL and extract magnet links as info hashes:**

    ```bash
    node index.js -u https://example.com -s .magnet-link -f hash
    ```

3. **Scrape a URL and output JSON format:**

    ```bash
    node index.js -u https://example.com -f json
    ```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

- **v1.0.0**: Initial release with basic functionality.

## Credits

- [@trippnology](https://github.com/trippnology) - Initial development and maintenance.

## License

UNLICENSED
