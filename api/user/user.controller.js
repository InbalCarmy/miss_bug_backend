import { userService } from './user.service.js';
import { loggerService } from '../../services/logger.service.js';

export async function getUsers(req, res){
    try{
        const filterBy = {
            txt: req.query.txt || '',
        }
        const users = await userService.query();
        res.send(users)
    } catch (err){
        loggerService.error('Cannot get users', err)
        res.status(400).send('Cannot get users')

    }
}

export async function getUser(req, res){
    const { userId } = req.params
    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(`Couldn't get user ${userId}`, err)
        res.status(400).send(`Couldn't get user`)
    }
}

export async function removeUser(req, res){
    const { userId } = req.params
    try{
        await userService.remove(userId);
        res.send('User removed')       
    }catch (err) {
        loggerService.error(`Cannot remove user ${userId}`, err)
        res.status(400).send('Cannot remove user')
    }
}

export async function updateUser(req, res){
    const { _id, fullname, username, password, score } = req.body
    const userToSave = { _id, fullname, username, password, score }
    try{
        const savedUser = await userService.save(userToSave);
        res.send(savedUser)
    }catch (err) {
        loggerService.error('Cannot save user', err)
        res.status(400).send('Cannot save user')
    }
}

export async function addUser(req, res){
    const { _id, fullname, username, password, score } = req.body
    const userToSave = { _id, fullname, username, password, score }
    try{
        const savedUser = await userService.save(userToSave);
        res.send(savedUser)
    }catch (err) {
        loggerService.error('Cannot save user', err)
        res.status(400).send('Cannot save user')
    }
}