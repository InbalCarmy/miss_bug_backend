import express from 'express';
import cors from 'cors'

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
// app.use(cookieParser())




//*------------ Bugs CRUD ---------------
//* Read/List
app.get('/api/bug', async(req, res) => {
    try{
        const bugs = await bugService.query();
        res.send(bugs)
    }catch (err){
        localStorage.errer('Cannot get bugs', err)
        res.status(400).send('Cannot get bugs')
    }
})

//* Add/Update
app.get('/api/bug/save', async(req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        severity: req.query.severity,
        description: req.query.description,
        createdAt: req.query.createdAt
    }

    try{
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug)
    }catch (err) {
        loggerService.error('Cannot save bug', err)
        res.status(400).send('Cannot save bug')
    }
})

//* Read
app.get('/api/bug/:bugId', async(req, res) => {
    const { bugId } = req.params
    try{
        const bug = await bugService.getById(bugId);
        res.send(bug)       
    }catch (err) {
        loggerService.error(`Cannot get bug ${bugId}`, err)
        res.status(400).send('Cannot get bug')
    }
})


//* Delete
app.get('/api/bug/remove/:bugId', async(req, res) => {
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
