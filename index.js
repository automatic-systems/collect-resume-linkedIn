require('dotenv').config()
var username = process.env.username
var password = process.env.password
var executable = process.env.chrome_executable
var outdir = process.env.out_dir
var parallel = process.env.parallel
var limit = process.env.limit
let error = require('debug')('error')
var loaded = require('debug')('loaded')
var { argv } = require('yargs')
    // .usage('Usage: $0 -username [ linkedin email ]\n -password [ linkedin password ]\n -filter [regular expression of profile names (optional)]\n -executable [chrome executable]\n -outdir [where to output user Profiles] -ntab [Number of tab instances to use]')
    .demandOption(['username', 'password', 'executable-path', 'user-data-dir'])
    .example('$0 -u nikhilesh@email.com -p <password> -f chauhan -e /bin/chrome -o ./profiles -n 10 -l 55')
    .example('$0 -u n@t -p <p> -e /bin/chrome -ud "~/.config/google/chrome/User Data" -pd "Profile 2"')
    .default({
        'filter': '.',
        'outdir': process.env.OUTDIR || './',
        'ntab': process.env.PARALLEL || 10,
        'limit': Infinity,
        'profile-dir': 'Default',
        headless: false
    })
    .help('help')
    .alias({ username: 'u', password: 'p', headless: 'h', filter: 'f', 'executable-path': 'e', limit: 'l', ntab: 'n', outdir: 'o', 'user-data-dir': 'ud', 'profile-dir': 'pd' })
    .epilog('copyright 2020 © nikhilesh')
var { username,
    password,
    "executable-path": executablePath,
    filter,
    outdir,
    'profile-dir': profileDir,
    "user-data-dir": userDataDir,
    limit,
    headless,
    ntab: parallel } = argv
var { login } = require('./login')
const { downloadProfiles } = require('./download')
require('./init').init({ executablePath, userDataDir, profileDir, headless }).then(async ({ browser, newPage }) => {
    var page = await newPage()
    await login(username, password, page)
    var count = await downloadProfiles({ outDir: outdir, parallel, limit, newPage, page, filter })
    loaded(`SuccessFully created :${count} Profile pdfs`)
})
//DEBUG=loaded,downloaded,error node index.js -u nikhileshofficial@gmail.com -p linkedIn@123 -e "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --ud "C:\Users\Shailesh\AppData\Local\Google\Chrome\User Data" --pd "Default" -l 10 -n 1 -o ./profiles
process.on('unhandledRejection', e => {
    error(`Unhandled Error ${e.message}`)
});