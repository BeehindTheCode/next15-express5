import path from 'path'
import express, { Application, NextFunction, Request, Response } from 'express'
import nextJS from 'next'
import nextBuild from 'next/dist/build'

const basePort = 3000
const dev = process.env.NODE_ENV !== 'production'

const nextApp = nextJS({ dev })
const handle = nextApp.getRequestHandler()

// Express application
const app: Application = express()

const start = () => {
  // Sites static directories
  app.use(express.static(path.join(__dirname, '../../public')))

  // Next.js build
  if (process.env.NEXT_BUILD) {
    app.listen(basePort, async () => {
      // Traffic handling
      app.all('*', (req: Request, res: Response) => handle(req, res))

      console.log(`Next.js is now building...`)

      await nextBuild(
        path.join(__dirname, '..'),
        false,
        false,
        false,
        false,
        false,
        true, // Turbo Next Build
        'default',
        ''
      )

      process.exit()
    })

    return
  }

  // Running Next App
  nextApp.prepare().then(() => {
    console.log('Next.js started')

    // Traffic handling
    app.use((req: Request, res: Response, next: NextFunction) => {
      handle(req, res).catch(next)
    })

    // Listening...
    app.listen(basePort, () => {
      console.log(`Server is running on port ${basePort}`)
    })
  })
}

start()
