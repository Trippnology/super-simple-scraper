# Super Simple Scraper

A simple command-line tool for scraping HTML content from a given URL and extracting data for further processing.

Good for grabbing all image/link/magnet URLs from a page, or extracting the text of certain elements.

NOT for scraping entire page content.

## Installation

### From npm

`npm i -g @trippnology/super-simple-scraper`

### From source

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
sss [options]
```

Or if you installed from source:

```bash
node index.js [options]
```

### Options

- `-u, --url <url>`: The URL to scrape (required).
- `-s, --selector <selector>`: CSS selector to find. Default is `a`.
- `-c, --content <type>`: Process each element as this type of content (`hash`, `html`, `image`, `json`, `link`, `object`, or `text`). Default is `link`.
- `-o, --output <format>`: Output format (`html`, `json`, `object`, or `text`). Default is `text`.

### Examples

1. **Scrape a specific URL with default options:** (this will find all links and return their hrefs)

    ```bash
    sss -u https://example.com
    ```

2. **Find all elements with a class of `.foo` and grab their HTML contents:**

    ```bash
    sss -u https://example.com -s .foo -c html
    ```

3. **Find all links and return their href:**

    ```bash
    sss -u http://localhost:8080/test.html -s a -c link
    ```

4. **Find all links and return their text:**

    ```bash
    sss -u http://localhost:8080/test.html -s a -c text
    ```

5. **Find all images and return their src:**

    ```bash
    sss -u http://localhost:8080/test.html -s img -c image
    ```

6. **Find all magnet links and return their infohash:**

    ```bash
    sss -u http://localhost:8080/test.html -s a[href^=magnet] -c hash
    ```

7. **Find all scripts containing JSON and return their contents:**

    ```bash
    sss -u http://localhost:8080/test.html -s script[type="application/json"] -c json
    ```

8. **Find all elements with a class of `.foo` and return the full [cheerio](https://cheerio.js.org/) object (useful for debugging):**

    ```bash
    sss -u http://localhost:8080/test.html -s .foo -c object -f object
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

- &copy; [Trippnology](https://trippnology.com)

## License

UNLICENSED
