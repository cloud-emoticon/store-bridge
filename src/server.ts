import express from 'express';
import rp from 'request-promise-native';
import Octokit from '@octokit/rest'
import { GitHubFile, MetaResponse } from './api'

const app = express();
const github = new Octokit()
const port = process.env["PORT"] || 3000

app.get('/', (req, res) => res.send('Willkommen to the Store'));

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

    const contents = repo.data as GitHubFile[]
    const repos = await Promise.all(contents
        .map(file => file.path)
        .filter(path => !path.includes("/"))
        .filter(path => path.endsWith(".meta.json"))
        .map(async (metaPath) => {
            const possibleLocalFilename = metaPath.substring(0, metaPath.length - ".meta.json".length)
            const metaUrl = `https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/${metaPath}`
            try {
                const metaRes = await rp(metaUrl)
                const meta = JSON.parse(metaRes) as MetaResponse
                let codeurl
                if (meta.location.type === "localJson") {
                    codeurl = `https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/${possibleLocalFilename}.json`
                } else if (meta.location.type === "localXml") {
                    codeurl = `https://raw.githubusercontent.com/cloud-emoticon/store-repos/master/${possibleLocalFilename}.xml`
                } else if (meta.location.type === "remoteJson") {
                    codeurl = meta.location.remoteUrl as string
                } else {
                    console.error(`unknown location type ${meta.location.type} for meta path ${metaPath}`)
                    return null
                }
                return {
                    "name": meta.name,
                    "codeurl": codeurl,
                    "introduction": meta.description,
                    "creator": meta.author.name,
                    "creatorurl": meta.author.url, // todo: default one
                    "iconurl": meta.author.avatarUrl // todo: default one
                }
            } catch (e) {
                console.error(`fail to obtain repo from meta path ${metaPath}, reason ${e}`)
                return null
            }
        })
        .filter(res => res !== null)
    )
    res.json(repos)
})

app.listen(port, () => console.log(`listening on port ${port}`));
