var launch = require('debug')('browser')
var error = require('debug')('browser:error')
var window = require('debug')('browser:window')
async function init({
    executablePath = (() => { throw "Executable Path is required" })(),
    userDataDir = './',
    profileDir = 'Default',
    headless = false }) {
    var puppeteer = require('puppeteer-extra')
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer.use(StealthPlugin())
    try {
        var browser = await puppeteer.launch({
            headless,
            executablePath,
            defaultViewport: null,
            args: ['--profile-directory=' + profileDir, '--user-data-dir=' + userDataDir, '--disable-web-security', '--no-sandbox', '--window-size=1920*720']
        });
        browser.on('close', () => launch("Browser Window Closed!"))
        launch(`Launch Successfull for executable ${headless ? 'headless' : 'headfull'}:${executablePath} `)
        launch(`Using Profile Directory ${profileDir} `)
        launch(`Using Data Directory ${userDataDir} `)
        var newPage = async function newPage(b = browser, timeout = 30000) {
            var pages = await b.pages();
            var id = Date.now() + Math.random(); //unique identifier
            var promise = new Promise((res, rej) => {
                async function captureMyTargetOnly(t) {
                    var page = await t.page();
                    if (page.url().endsWith(id)) {
                        page.id = id
                        res(page);
                        window(`New Page created with ID:${id}`)
                        page.on('close', () =>
                            window(`Page closed with ID:${id}`))
                        b.removeListener("targetcreated", captureMyTargetOnly);
                    }
                }
                b.on("targetcreated", captureMyTargetOnly);
                setTimeout(() => {
                    b.removeListener("targetcreated", captureMyTargetOnly);
                    rej("Timout");
                }, timeout);
            });
            await pages[0].evaluate(
                (id) =>
                    window.open(
                        `about:blank?id=${id}`
                    ),
                id
            );
            return promise;
        }
        return {
            browser, newPage
        }
    }
    catch (e) {
        error(`Launch failed with Error '${e.message}'`)
        error(`Launch failed for executable ${headless ? 'headless' : 'headfull'}:${executablePath} `)
        error(`Using Profile Directory ${profileDir} `)
        error(`Using Data Directory ${userDataDir} `)
    }
}
module.exports = { init }