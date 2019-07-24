import express from 'express';
import fetchRepos from './fetchRepos'

const app = express();
app.set('view engine', 'ejs');

const port = process.env["PORT"] || 3000

app.get('/', (req, res) => {
    res.render('index')
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
