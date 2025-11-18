import { authService } from '../api/auth/auth.service.js'

export function requireAuth(req, res, next) {
	const loginToken = req.cookies.loginToken
	const loggedinUser = authService.validateToken(loginToken)

	if (!loggedinUser) return res.status(401).send('Please login')
    req.loggedinUser = loggedinUser
    
    next()
}
