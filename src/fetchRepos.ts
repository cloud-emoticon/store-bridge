import rp from 'request-promise-native';
import Octokit from '@octokit/rest'
import { GitHubFile, MetaResponse, Repository } from './api'

if (!process.env["GITHUB_AUTH"]) {
    throw new Error(`env var GITHUB_AUTH not found`)
}
const githubAuth = process.env["GITHUB_AUTH"]

const github = new Octokit({
    auth: githubAuth
})

const fetchRepos: () => Promise<Repository[]> = async () => {
    const repo = await github.repos.getContents({
        owner: 'cloud-emoticon',
        repo: 'store-repos',
        path: '/'
    })
    if (repo.status !== 200) {
        throw new Error(`fail to fetch store-repos, status ${repo.status}`)
    }

    const contents = repo.data as GitHubFile[]
    return await Promise.all(contents
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
}

export default fetchRepos