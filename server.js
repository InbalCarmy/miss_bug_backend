import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'


import {bugService} from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//* ------------------- Config -------------------
const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')




//*------------ Bugs CRUD ---------------
//* Read/List
app.get('/api/bug', async(req, res) => {
    const { txt, minSeverity, labels, pageIdx, sortBy, sortDir } = req.query
    const filterBy = {
        txt,
        minSeverity: minSeverity ? +minSeverity : 0,
        labels: labels ? labels.split(',') : [],
        sortBy: sortBy || 'createdAt',
        sortDir: sortDir ? +sortDir : -1
    }

    if (pageIdx !== undefined) filterBy.pageIdx = +pageIdx

    console.log('filterBy:', filterBy)
    try{
        const bugs = await bugService.query(filterBy);
        res.send(bugs)
    } catch (err){
        loggerService.error('Cannot get bugs', err)
        res.status(400).send('Cannot get bugs')

    }
})

//* Read
app.get('/api/bug/:bugId', async (req, res) => {
    const { bugId } = req.params
    if (req.cookies.visitedBugs) {
        var visitedBugs = JSON.parse(req.cookies.visitedBugs)
    } else {
        var visitedBugs = []
    }

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length < 3) visitedBugs.push(bugId)
        else return res.status(401).send('wait for while...')
    }

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 10000 })
    console.log(visitedBugs)

    try {
        const bug = await bugService.getById(bugId)
        res.send(bug)
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send(`Couldn't get bug`)
    }
})

//* Add/Update
app.put('/api/bug/:bugId', async(req, res) => {
    const { _id, title, severity, description, labels } = req.body
    const bugToSave = { _id, title, severity, description, labels }
    try{
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug)
    }catch (err) {
        loggerService.error('Cannot save bug', err)
        res.status(400).send('Cannot save bug')
    }
})

app.post('/api/bug', async(req, res) => {
    const { _id, title, severity, description, labels } = req.body
    const bugToSave = { _id, title, severity, description, labels }
    try{
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug)
    }catch (err) {
        loggerService.error('Cannot save bug', err)
        res.status(400).send('Cannot save bug')
    }
})

//* Delete
app.delete('/api/bug/:bugId', async(req, res) => {
    const { bugId } = req.params
    try{
        await bugService.remove(bugId);
        res.send('Bug removed')       
    }catch (err) {
        loggerService.error(`Cannot remove bug ${bugId}`, err)
        res.status(400).send('Cannot remove bug')
    }
})




const port = 3030;
app.listen(port, () => { 
    console.log(`Server is running on port ${port}`); });
