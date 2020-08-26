
var loaded = require('debug')('loaded')
var downloaded = require('debug')('downloaded')
var error = require('debug')('error')
async function getContacts(limit = Infinity, timeout = 500000) {
    var result = 0
    var count = Math.min(Number(document.querySelector('header.mn-connections__header').innerText.split(" ")[0]), limit)
    var scrollheight = 0
    function shake() {
        document.body.scrollIntoView(true)
    }
    return new Promise((res, rej) => {
        var interval = setInterval(collectRecursively, 500)
        var shakeinterval = setInterval(shake, 3500)
        var timer = setTimeout(packup, timeout)
        function packup() {
            clearInterval(interval)
            clearInterval(shakeinterval)
            clearTimeout(timer)
            result = [...document.querySelectorAll('a[data-control-name=connection_profile].mn-connection-card__link')].map(a => a.href)
            res({ count, result })
        }
        function collectRecursively() {
            document.body.scrollIntoView(false);
            if (scrollheight < document.body.scrollHeight) {
                scrollheight = document.body.scrollHeight
                result = document.querySelectorAll('a[data-control-name=connection_profile].mn-connection-card__link').length
            }
            if (count <= result) packup()
        }
    })
}
var fs = require('fs')
var path = require('path')
async function downloadProfile({ url, outDir, newPage }, done = () => { }, spage = undefined) {
    var [name,] = url.split("/").slice(-2)
    var page = spage || await newPage()
    var p = path.resolve(path.join(outDir, name))
    fs.mkdirSync(p, { recursive: true })
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: p,
    });
    page.goto(url, { waitUntil: 'load', timeout: 0 })
    await page.waitForSelector('button.pv-s-profile-actions__overflow-toggle')
    loaded(`loaded ${name} 's Profile`)
    await page.click('button.pv-s-profile-actions__overflow-toggle')
    await page.waitForSelector('.pv-s-profile-actions.pv-s-profile-actions--save-to-pdf')
    await page.click('.pv-s-profile-actions.pv-s-profile-actions--save-to-pdf')
    return new Promise((res, rej) => {
        function watcher(eventype, filename) {
            console.log('=====>', filename, eventype)
            if (eventype != 'rename' || filename != 'Profile.pdf') return
            downloaded(`Downloaded ${path.join(p, filename)}`)
            eyes.close()
            res(page)
            done(page)
        }
        var eyes = fs.watch(p, watcher)
    })
}
async function downloadProfiles({ outDir = "./profiles", parallel = 1, limit = Infinity, newPage, filter, page }) {
    page = page || await newPage()
    var regex = new RegExp(filter)
    page.goto('https://www.linkedin.com/mynetwork/invite-connect/connections/', { waitUntil: 'load', timeout: 0 })
    await page.waitForSelector('header.mn-connections__header')
    await page.waitForSelector('a[data-control-name=connection_profile].mn-connection-card__link')
    var { result: profileURLs } = await page.evaluate(getContacts, limit)
    var pages = []
    page.close()
    var finished = 0 //keep it var
    var done = false
    async function open(page) {
        if (finished == profileURLs.length || finished > limit) {
            loaded(`finished loadign all profiles`)
            done = true
            return
        }
        else {
            finished += 1;
            while (!regex.test(profileURLs[finished].split("/").slice(-2)[0])) {
                finished += 1
            };
            loaded(`loading ${profileURLs[finished].split("/").slice(-2)[0]} 's Profile`)
            if (page)
                await downloadProfile({ url: profileURLs[finished], outDir, newPage }, open, page)
            else
                downloadProfile({ url: profileURLs[finished], outDir, newPage }, open).then(page => pages.push(page))
        }
    }
    for (var t = 0; t < Math.min(parallel, profileURLs.length) && finished < profileURLs.length; t++) open()
    return new Promise((res, rej) => {
        var interval = setInterval(() => {
            if (done) {
                clearInterval(interval)
                pages.map(page => page.close())
                res(profileURLs.length)
            }
        }, 1000);
    })
}
module.exports = { downloadProfiles }