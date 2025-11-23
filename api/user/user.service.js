import { dbService } from '../../services/db.service.js'
import { loggerService } from "../../services/logger.service.js"
import { ObjectId } from 'mongodb'

// import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
// import { bugService } from "../bug/bug.service.js"


export const userService = {
    query,
    getById,
    remove,
    update,
    getByUsername
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        loggerService.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }

        // user.givenReviews = await reviewService.query(criteria)
        // user.givenReviews = user.givenReviews.map(review => {
        //     delete review.byUser
        //     return review
        // })

        return user
    } catch (err) {
        loggerService.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        loggerService.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        console.log('userId:', userId)
        
        const bugCollection = await dbService.getCollection('bug')
        // Debug - check what's in bugs
        const allBugs = await bugCollection.find({}).toArray()
        console.log('All bug creator._ids:', allBugs.map(b => b.creator?._id))

        const userBugs = await bugCollection.countDocuments({
        'creator._id': ObjectId.createFromHexString(userId)
        })
        console.log('userBugs count:', userBugs)

        if (userBugs > 0) {
            throw new Error(`Cannot delete user - has ${userBugs} bugs`)
        }
        
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        loggerService.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId.createFromHexString(user._id), // needed for the returnd obj
            fullname: user.fullname,
            score: user.score,
            username: user.username,
            password: user.password
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        loggerService.error(`cannot update user ${user._id}`, err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                username: txtCriteria,
            },
            {
                fullname: txtCriteria,
            },
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}