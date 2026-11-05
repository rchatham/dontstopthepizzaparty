# [dontstopthepizzaparty]

A work in progress...

## Jekyll hosted on GitHub pages.

Install [Jekyll](http://jekyllrb.com/) by typing the following into the command line.
```
$ gem install jekyll bundler
```
Then once you have cloned the repository and navigated to it you can preview at [http://localhost:4000](http://localhost:4000) by typing the following into the command line.
```
$ jekyll serve
```

## Testing the homepage

`test/hero.test.js` drives the homepage in headless Chromium at phone (390×844) and desktop (1440×900) sizes. It checks:

- the layout
- the title's click bounce and confetti
- the stage controls
- light intensity, tempo and motion
- sound on and off
- reduced motion
- the `techno` secret word

It fails on any page error. Build the site first, then run it:
```
$ bundle exec jekyll build
$ npm install && npx playwright install chromium   # first time only
$ npm test
```
`SITE_DIR=path npm test` tests another build. `SCREENSHOTS=shots npm test` also saves a phone and a desktop screenshot.
 
## Goals/Thoughts
- [ ] Integrate Medium for Blog Posts
- [ ] Customize Instagram feed
- [ ] Add more fun content to main page
- [ ] Other types of content
- [ ] Pizza Squad logins? Accounts?
- [ ] Calendar
- [ ] Email list?
 
 
 [dontstopthepizzaparty]: http://dontstopthepizzaparty.com
