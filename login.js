async function login(username, password, page, timeout = 60 * 1000) {
    if (!(username && password)) throw "Username and password are required"
    page.goto('https://www.linkedin.com/')
    try {
        await page.waitForSelector('#session_key')
        await page.type('#session_key', username)
        await page.type('#session_password', password)
        page.click('.sign-in-form__submit-button')
        var oldurl = page.url()
        return new Promise((res, rej) => {
            setTimeout(() => {
                clearInterval(interval)
                rej("Login  Timeout")
            }, timeout)
            var interval = setInterval(() => {
                if (page.url().startsWith('https://www.linkedin.com/feed')) {
                    res(page)
                    clearInterval(interval)
                }
            }, 300)
        })
    }
    catch (e) {
        if (page.url().startsWith('https://www.linkedin.com/feed'))
            return (page)
        else {
            throw ("Error in Login")
        }
    }
}
module.exports = { login }