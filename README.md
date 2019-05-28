# Tangerine
<sub><sup>(aka Hijacky McHijackface)</sup></sub>


### Development
Install [tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)

1. Clone/fork the repo
2. Add `userscript.local.js` to tampermonkey
3. Install dependencies and run the dev server
```bash
yarn # or npm install
npm start
```

This will execute the dev server on port `5000`, with a self signed certificate. You'll need to access the page first and let chrome know you're okay with the self generated certificate.

After that, go to pomelo's `/daily_tasks` and if everything went right, you should be seeing a button to open the agenda view.

PRs welcome!
