import express from 'express';
import fetchRepos from './fetchRepos'

const app = express();
app.set('view engine', 'ejs');

const port = process.env["PORT"] || 3000

app.get('/', async (req, res) => {
    res.render('index', {
        repos: (await fetchRepos()).map(repo => {
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
        res.json(await fetchRepos())
    } catch (e) {
        console.error(e)
        res.status(500)
    }
})

app.listen(port, () => console.log(`listening on port ${port}`));
