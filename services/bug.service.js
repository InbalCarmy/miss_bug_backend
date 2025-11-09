import { loggerService } from "./logger.service.js"
import { readJsonFile, writeJsonFile, makeId } from "./utils.js"


export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = readJsonFile('./data/bugs.json')

// async function query() {
//     try{
//         return bugs
//     }catch (err){
//         throw err
//     }
// }

async function query(filterBy) {
    let bugsToDisplay = bugs
    try{
        if(filterBy.txt){
            const regExp = new RegExp(filterBy.txt, 'i')
            // bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title) || regExp.test(bug.description))
            bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))

        }

        if(filterBy.minSeverity){
            bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
        }

        if(filterBy.labels && filterBy.labels.length){
            bugsToDisplay = bugsToDisplay.filter(bug =>
                bug.labels && filterBy.labels.every(label => bug.labels.includes(label))
            )
        }

        return bugsToDisplay
    }  catch (err){
        loggerService.error('Cannot filter bugs', err) 
        throw err
    }
}

async function save(bugToSave){
    try{
        if(bugToSave._id){
            const bugId = bugs.findIndex(bug => bug._id ===bugToSave._id)
            if(bugId < 0) throw new Error ('Bug not found')
            bugs[bugId] = bugToSave
        }else{
            bugToSave._id = makeId()
            bugToSave.createdAt = Date.now()
            bugs.push(bugToSave)
        }
        await _saveBugsToFile()
        return bugToSave

    }catch (err){
        throw err
    }
}

async function getById(bugId) {
    try{
        const bug = bugs.find(bug => bug._id === bugId)
        if(!bug) throw new Error ('Bug not found')
        return bug
    }catch (err){
        throw err
    }
}

async function remove(bugId) {
    try{
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        if(bugIdx < 0) throw new Error ('Bug not found')
        bugs.splice(bugIdx, 1)
        await _saveBugsToFile()
    }catch (err){
        throw err
    } 
}




function _saveBugsToFile() {
    return writeJsonFile('./data/bugs.json', bugs)
}