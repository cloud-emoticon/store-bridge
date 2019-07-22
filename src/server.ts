import express from 'express';
import Octokit from '@octokit/rest'
import { File } from './api'

const app = express();
const github = new Octokit()
const port = process.env.Port || 3000

app.get('/', (req, res) => res.send('Velcome to the Store'));

app.get('/json', async (req, res) => {
    const repo = await github.repos.getContents({
        owner: 'cloud-emoticon',
        repo: 'store-repos',
        path: '/'
    })
    if (repo.status !== 200) {
        res.status(repo.status).json([])
        return
    }

    const data = repo.data as File[]
    res.json(
        data
            .filter(d => !d.path.includes("/"))
            .filter(d => d.path.endsWith(".json") || d.path.endsWith(".xml"))
            .map(d => {
                return {
                    "name": d.path,
                    "codeurl": `https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/${d.path}`,
                    "introduction": "N/A",
                    "creator": "N/A",
                    "creatorurl": "http://emoticon.moe",
                    "iconurl": "http://emoticon.moe/img/favicon.ico"
                }
            })
    )
})

app.listen(port, () => console.log(`listening on port ${port}`));
