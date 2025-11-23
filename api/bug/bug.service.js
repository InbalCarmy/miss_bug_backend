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

const PAGE_SIZE = 3

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('bug')
        let cursor = collection.find(criteria)

        // Sorting in MongoDB
        if (filterBy.sortBy) {
            cursor = cursor.sort({ [filterBy.sortBy]: filterBy.sortDir })
        }

        // Pagination in MongoDB
        if (filterBy.pageIdx !== undefined) {
            cursor = cursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }
        const bugs = await cursor.toArray()
                console.log('bugs:', bugs);

        return bugs
    } catch (err) {
        loggerService.error('Cannot filter bugs', err)
        throw err
    }
}


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
        if (!isAdmin) criteria['creator._id'] = creatorId
        
        const collection = await dbService.getCollection('bug')
        const res = await collection.updateOne(criteria, { $set: bugToSave })
        if (res.matchedCount === 0) throw new Error('Not your bug or bug not found')

        return bug
    } catch (err) {
        loggerService.error(`cannot update bug ${bug._id}`, err)
        throw err
    }
}

async function remove(bugId) {
    const {loggedinUser} = asyncLocalStorage.getStore()
    const {_id: creatorId, isAdmin } = loggedinUser
    

    try{
        const collection = await dbService.getCollection('bug')
        const criteria = { _id: ObjectId.createFromHexString(bugId) }
        if(!isAdmin) criteria['creator._id'] = creatorId
        const res = await collection.deleteOne(criteria)
        if(res.deletedCount === 0) throw new Error ('Not your bug or bug not found')
    }catch (err){
        loggerService.error(`Cannot remove bug ${bugId}`, err)
        throw err
    }
}

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
          criteria['creator._id'] = ObjectId.createFromHexString(filterBy.createdBy)
      }

      return criteria
  }