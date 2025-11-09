import { loggerService } from "../../services/logger.service.js"
import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"


export const userService = {
    query,
    getById,
    remove,
    save
}

const users = readJsonFile('./data/users.json')
const PAGE_SIZE = 3

async function query() {
    let usersToDisplay = users
    try{
        // if(filterBy.txt){
        //     const regExp = new RegExp(filterBy.txt, 'i')
        //     // usersToDisplay = usersToDisplay.filter(user => regExp.test(user.title) || regExp.test(user.description))
        //     usersToDisplay = usersToDisplay.filter(user => regExp.test(user.title))

        // }

        // if(filterBy.minSeverity){
        //     usersToDisplay = usersToDisplay.filter(user => user.severity >= filterBy.minSeverity)
        // }

        // if(filterBy.labels && filterBy.labels.length){
        //     usersToDisplay = usersToDisplay.filter(user =>
        //         user.labels && filterBy.labels.every(label => user.labels.includes(label))
        //     )
        // }

        // // Sorting
        // if(filterBy.sortBy){
        //     usersToDisplay.sort((a, b) => {
        //         let aVal = a[filterBy.sortBy]
        //         let bVal = b[filterBy.sortBy]

        //         // Handle string vs number comparison
        //         if(typeof aVal === 'string') {
        //             aVal = aVal.toLowerCase()
        //             bVal = bVal.toLowerCase()
        //         }

        //         // sortDir: 1 = ascending, -1 = descending
        //         if(aVal > bVal) return 1 * filterBy.sortDir
        //         if(aVal < bVal) return -1 * filterBy.sortDir
        //         return 0
        //     })
        // }

        // if('pageIdx' in filterBy) {
        //     const startIdx = filterBy.pageIdx * PAGE_SIZE
        //     usersToDisplay = usersToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
        // }

        return usersToDisplay
    }  catch (err){
        loggerService.error('Cannot filter users', err) 
        throw err
    }
}

async function save(userToSave){
    try{
        if(userToSave._id){
            const userId = users.findIndex(user => user._id ===userToSave._id)
            if(userId < 0) throw new Error ('User not found')
            users[userId] = userToSave
        }else{
            userToSave._id = makeId()
            userToSave.createdAt = Date.now()
            users.push(userToSave)
        }
        await _saveUsersToFile()
        return userToSave

    }catch (err){
        throw err
    }
}

async function getById(userId) {
    try{
        const user = users.find(user => user._id === userId)
        if(!user) throw new Error ('User not found')
        return user
    }catch (err){
        throw err
    }
}

async function remove(userId) {
    try{
        const userIdx = users.findIndex(user => user._id === userId)
        if(userIdx < 0) throw new Error ('User not found')
        users.splice(userIdx, 1)
        await _saveUsersToFile()
    }catch (err){
        throw err
    } 
}




function _saveUsersToFile() {
    return writeJsonFile('./data/users.json', users)
}