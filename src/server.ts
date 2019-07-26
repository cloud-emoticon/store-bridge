require('dotenv').config()

import express from 'express';
import fetchRepos from './fetchRepos'
import { Repository } from './api'

const port = process.env["PORT"] || 3000
if (!process.env["FETCH_INTERVAL_SECONDS"]) {
    throw new Error(`env var FETCH_INTERVAL_SECONDS not found`)
}
const fetchIntervalSeconds = process.env["FETCH_INTERVAL_SECONDS"] as unknown as number

const app = express();
app.set('view engine', 'ejs');

let repos: Repository[]
(async () => {
    console.log('fetching repos...')
    repos = await fetchRepos()
    console.log('fetched repos...')
})()
setInterval(async () => {
    console.log('refreshing repos...')
    repos = await fetchRepos()
    console.log('refreshed repos...')
}, fetchIntervalSeconds * 1000)

app.get('/', async (req, res) => {
    res.render('index', {
        repos: repos.map(repo => {
            const codeurl = repo.codeurl
            let appUrl = codeurl
            if (codeurl.startsWith("http://")) {
                appUrl = codeurl.replace("http://", "cloudemoticon://")
            } else if (codeurl.startsWith("https://")) {
                appUrl = codeurl.replace("https://", "cloudemoticon://")
            }
            return {
                ...repo,
                appurl: appUrl
            }
        })
    })
});

app.get('/json', async (req, res) => {
    try {
        res.json(repos)
    } catch (e) {
        console.error(e)
        res.status(500)
    }
})

app.listen(port, () => console.log(`listening on port ${port}`));
