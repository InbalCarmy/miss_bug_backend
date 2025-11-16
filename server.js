import { loggerService } from './services/logger.service.js'

import express from 'express';
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'


const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}

// App configuration
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.json())
app.set('query parser', 'extended')

//Routes
import { bugRoutes } from './api/bug/bug.routes.js';
import { userRoutes } from './api/user/user.routes.js';
import { authRoutes } from './api/auth/auth.routes.js'


app.use('/api/bug', bugRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes)


//* For SPA (Single Page Application) - catch all routes and send to the index.html
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://localhost:${port}/`)
)
