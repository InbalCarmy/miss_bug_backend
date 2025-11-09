import { bugService } from './bug.service.js';
import { loggerService } from '../../services/logger.service.js';

export async function getBugs(req, res){
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
}

export async function getBug(req, res){
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
}

export async function removeBug(req, res){
    const { bugId } = req.params
    try{
        await bugService.remove(bugId);
        res.send('Bug removed')       
    }catch (err) {
        loggerService.error(`Cannot remove bug ${bugId}`, err)
        res.status(400).send('Cannot remove bug')
    }
}

export async function updateBug(req, res){
    const { _id, title, severity, description, labels } = req.body
    const bugToSave = { _id, title, severity, description, labels }
    try{
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug)
    }catch (err) {
        loggerService.error('Cannot save bug', err)
        res.status(400).send('Cannot save bug')
    }
}

export async function addBug(req, res){
    const { _id, title, severity, description, labels } = req.body
    const bugToSave = { _id, title, severity, description, labels }
    try{
        const savedBug = await bugService.save(bugToSave);
        res.send(savedBug)
    }catch (err) {
        loggerService.error('Cannot save bug', err)
        res.status(400).send('Cannot save bug')
    }
}