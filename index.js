const fastify = require('fastify')
const helmet = require('fastify-helmet')
const cors = require('fastify-cors')
const mongoose = require('mongoose')

const NODE_ENV = process.env.NODE_ENV || 'development'
const LOGGER = NODE_ENV !== 'production'
const PORT = 5000
const MONGODB_URL =
  'mongodb://b46bcdaab9f7b0733c1e:fe1c70d56e93be32264f5c290c0ab7e6@ds145895.mlab.com:45895/beam-backend'

const server = fastify({ logger: LOGGER })

const ProfileModel = mongoose.model(
  'Profile',
  new mongoose.Schema({
    address: String,
    username: String,
    pinnedFiles: Array
  })
)

server.register(helmet)
server.register(cors)

server.get('/:address', async (req, res) => {
  try {
    const { address } = req.params

    const { username, pinnedFiles } = await ProfileModel.findOne({ address })

    res.status(200).send({
      success: true,
      result: {
        username,
        pinnedFiles
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({
      success: false,
      message: 'Something went wrong'
    })
  }
})

server.post('/:address', async (req, res) => {
  try {
    const { address } = req.params
    console.log('req.body', req.body)
    const { username, pinnedFiles } = req.body.profile

    const dataToSave = {
      address,
      username,
      pinnedFiles
    }

    const result = await ProfileModel.findOneAndUpdate(
      { address },
      dataToSave,
      { upsert: true }
    )

    if (!result) {
      const profile = new ProfileModel(dataToSave)
      await profile.save()
    }

    res.status(200).send({
      success: true
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({
      success: false,
      message: 'Something went wrong'
    })
  }
})

server.ready(() => {
  mongoose.connect(MONGODB_URL)
})

server.listen(PORT, error => {
  if (error) {
    return console.log('Something went wrong', error)
  }

  console.log('Server listening on port', PORT)
})
