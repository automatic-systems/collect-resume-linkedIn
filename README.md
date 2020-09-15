# collect-resume-linkedIn
A simple automation script to download few or all resumes from your linkedIn profile

## Usage
### To Scrap profiles on your account
```sh
node . -u <your username /email> -p <password> -f <[optional] partial or full name to target> -e <chrome executable> -o <'chrome profile to use in chrome runtime, useful in certain cases'>
  -n 10 -l 55
```

### More
```sh
Options:
  --version              Show version number                           [boolean]
  --help                 Show help                                     [boolean]
  --username, -u                                                      [required]
  --password, -p                                                      [required]
  --executable-path, -e                                               [required]
  --user-data-dir, --ud                                               [required]
  --filter, -f                                                    [default: "."]
  --outdir, -o                                           [default: "./profiles"]
  --ntab, -n                                                        [default: 1]
  --limit, -l                                                [default: Infinity]
  --profile-dir, --pd                                       [default: "Default"]
  --headless, -h                                                [default: false]

Examples:
  -u nikhilesh@email.com -p <password> -f chauhan -e /bin/chrome -o ./profiles
  -n 10 -l 55
  -u n@t -p <p> -e /bin/chrome -ud "~/.config/google/chrome/User Data" -pd
  "Profile 2"

copyright 2020 © nikhilesh
```

## Debug
- browser | log all of runtime debug info
- browser:error | log only error message
- browser:window | log chromium window related events
eg.
```sh
DEBUG=browser* node .    .... 
```