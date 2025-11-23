import 'dotenv/config'
import { loggerService } from './services/logger.service.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

import express from 'express';
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'


const app = express();

// const corsOptions = {
//     origin: [
//         'http://127.0.0.1:5173',
//         'http://localhost:5173'
//     ],
//     credentials: true
// }

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:8080',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://localhost:5173'
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

// App configuration
// app.use(cors(corsOptions))
app.use(cookieParser())
// app.use(express.static('public'))
app.use(express.json())
app.set('query parser', 'extended')

//Routes
import { bugRoutes } from './api/bug/bug.routes.js';
import { userRoutes } from './api/user/user.routes.js';
import { authRoutes } from './api/auth/auth.routes.js'

app.all('/*all', setupAsyncLocalStorage)

app.use('/api/bug', bugRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes)


//* For SPA (Single Page Application) - catch all routes and send to the index.html
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve('public/index.html'))
    } else {
        next()
    }
})

console.log(process.env.PORT)
const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://localhost:${PORT}/`)
)
