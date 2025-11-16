import { loggerService } from "../../services/logger.service.js"
import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"


export const userService = {
    query,
    getById,
    remove,
    save,
    getByUsername
}

const users = readJsonFile('./data/users.json')

async function query() {
    return users
}

async function getById(userId) {
    try{
        const user = users.find(user => user._id === userId)
        if(!user) throw `User not found by userId : ${userId}`
        return user
    }catch (err){
        loggerService.error('userService[getById] : ', err)
        throw err
    }
}

async function getByUsername(username) {
    try{
        const user = users.find(user => user.username === username)
        return user
    }catch (err){
      loggerService.error('userService[getByUsername] : ', err)
        throw err
    }
}

async function remove(userId) {
    try{
        const userIdx = users.findIndex(user => user._id === userId)
        if(userIdx === -1) throw `Could not find user by userId: ${userId}`
        users.splice(userIdx, 1)
        await _saveUsersToFile()
    }catch (err){
        loggerService.error('userService[remove] : ', err)
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
        loggerService.error('userService[save] : ', err)
        throw err
    }
}



function _saveUsersToFile() {
    return writeJsonFile('./data/users.json', users)
}