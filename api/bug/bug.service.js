import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from "../../services/logger.service.js"
import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { asyncLocalStorage } from '../../services/als.service.js'
import { log } from 'console'



export const bugService = {
    query,
    getById,
    remove,
    add,
    update
}

// const bugs = readJsonFile('./data/bugs.json')
const PAGE_SIZE = 3

// async function query(filterBy) {
//     let bugsToDisplay = bugs
//     try{
//         if(filterBy.txt){
//             const regExp = new RegExp(filterBy.txt, 'i')
//             // bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title) || regExp.test(bug.description))
//             bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))

//         }
//         if(filterBy.minSeverity){
//             bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
//         }
//         if(filterBy.labels && filterBy.labels.length){
//             bugsToDisplay = bugsToDisplay.filter(bug =>
//                 bug.labels && filterBy.labels.every(label => bug.labels.includes(label))
//             )
//         }

//         if(filterBy.createdBy){
//             bugsToDisplay = bugsToDisplay.filter(bug => bug.creator._id === filterBy.createdBy)
//         }
//         // Sorting
//         if(filterBy.sortBy){
//             bugsToDisplay.sort((a, b) => {
//                 let aVal = a[filterBy.sortBy]
//                 let bVal = b[filterBy.sortBy]

//                 // Handle string vs number comparison
//                 if(typeof aVal === 'string') {
//                     aVal = aVal.toLowerCase()
//                     bVal = bVal.toLowerCase()
//                 }

//                 // sortDir: 1 = ascending, -1 = descending
//                 if(aVal > bVal) return 1 * filterBy.sortDir
//                 if(aVal < bVal) return -1 * filterBy.sortDir
//                 return 0
//             })
//         }

//         if('pageIdx' in filterBy) {
//             const startIdx = filterBy.pageIdx * PAGE_SIZE
//             bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
//         }

//         return bugsToDisplay
//     }  catch (err){
//         loggerService.error('Cannot filter bugs', err) 
//         throw err
//     }
// }

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('bug')
        // let bugsToDisplay = await collection.find(criteria).toArray()
        let cursor = collection.find(criteria)

        // Sorting in MongoDB
        if (filterBy.sortBy) {
            cursor = cursor.sort({ [filterBy.sortBy]: filterBy.sortDir })
        }

        // Pagination in MongoDB
        if (filterBy.pageIdx !== undefined) {
            cursor = cursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }

        // if ('pageIdx' in filterBy) {
        //     const startIdx = filterBy.pageIdx * PAGE_SIZE
        //     bugsToDisplay.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        // }

        const bugs = await cursor.toArray()
        return bugs
    } catch (err) {
        loggerService.error('Cannot filter bugs', err)
        throw err
    }
}

// async function save(bugToSave, loggedinUser){
//     try{
//         if(bugToSave._id){
//             const bugIdx = bugs.findIndex(bug => bug._id ===bugToSave._id)
//             if(bugIdx === -1) throw new Error ('Bug not found')
                
//             if(!loggedinUser.isAdmin && bugs[bugIdx].creator._id !== loggedinUser._id) throw 'Not your bug'

//             // bugs[bugIdx] = bugToSave
//             bugs.splice(bugIdx, 1, {...bugs[bugIdx], ...bugToSave })
//         }else{
//             bugToSave._id = makeId()
//             bugToSave.createdAt = Date.now()
//             bugToSave.creator = loggedinUser
//             bugs.push(bugToSave)
//         }
//         await _saveBugsToFile()
//         return bugToSave

//     }catch (err){
//         throw err
//     }
// }

async function add(bug) {
    try {
        const store = asyncLocalStorage.getStore()
        console.log('store:', store) 

        const { loggedinUser } = asyncLocalStorage.getStore()
        console.log('loggedin user: ', loggedinUser);
        
        bug.creator = loggedinUser 
        console.log('bug creator: ', bug.creator);
        

        const collection = await dbService.getCollection('bug')
        await collection.insertOne(bug)
        return bug
    } catch (err) {
        loggerService.error('cannot insert bug', err)
        throw err
    }
}

async function update(bug) {
    const {loggedinUser} = asyncLocalStorage.getStore()
    const {_id: creatorId, isAdmin } = loggedinUser
    const bugToSave = { title: bug.title, severity: bug.severity, description: bug.description, labels: bug.labels }

    try {
        const criteria = { _id: ObjectId.createFromHexString(bug._id) }
        const collection = await dbService.getCollection('bug')
        await collection.updateOne(criteria, { $set: bugToSave })

        return bug
    } catch (err) {
        loggerService.error(`cannot update bug ${bug._id}`, err)
        throw err
    }
}




// async function getById(bugId) {
//     try{
//         const bug = bugs.find(bug => bug._id === bugId)
//         if(!bug) throw new Error ('Bug not found')
//         return bug
//     }catch (err){
//         throw err
//     }
// }

async function getById(bugId) {
    try{
        const criteria = { _id: ObjectId.createFromHexString(bugId) }
        const collection = await dbService.getCollection('bug')
        const bug = await collection.findOne(criteria)
        
        bug.createdAt = bug._id.getTimestamp()
        return bug
    }catch (err){
        loggerService.error(`While finding bug ${bugId}`, err)
        throw err
}
}

async function remove(bugId) {
    const {loggedinUser} = asyncLocalStorage.getStore()
    const {_id: creatorId, isAdmin } = loggedinUser

    try{
        const criteria = { _id: ObjectId.createFromHexString(bugId) }
        if(!isAdmin) criteria['creator._id'] = creatorId

        const collection = await dbService.getCollection('bug')
        const res = await collection.deleteOne(criteria)
        if(res.deletedCount === 0) throw new Error ('Not your bug or bug not found')
    }catch (err){
        loggerService.error(`Cannot remove bug ${bugId}`, err)
        throw err
    }
}

// async function remove(bugId, loggedinUser) {
//     try{
//         const bugIdx = bugs.findIndex(bug => bug._id === bugId)
//         if(bugIdx < 0) throw new Error ('Bug not found')
//         if(!loggedinUser.isAdmin && bugs[bugIdx].creator._id !== loggedinUser._id) throw 'Not your bug'

//         bugs.splice(bugIdx, 1)
//         await _saveBugsToFile()
//     }catch (err){
//         throw err
//     } 
// }




// function _saveBugsToFile() {
//     return writeJsonFile('./data/bugs.json', bugs)
// }

  function _buildCriteria(filterBy) {
      const criteria = {}

      if (filterBy.txt) {
          criteria.title = { $regex: filterBy.txt, $options: 'i' }
      }

      if (filterBy.minSeverity) {
          criteria.severity = { $gte: filterBy.minSeverity }
      }

      if (filterBy.labels && filterBy.labels.length) {
          criteria.labels = { $all: filterBy.labels }
      }

      if (filterBy.createdBy) {
          criteria['creator._id'] = filterBy.createdBy
      }

      return criteria
  }