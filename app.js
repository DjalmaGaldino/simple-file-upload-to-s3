require('dotenv').config()
const express = require('express')
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const app = express()
app.use(express.json())

aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION
})

const s3 = new aws.S3()
const BUCKET = process.env.BUCKET

const upload = multer({
  storage: multerS3({
    useDualstackEndpoint: true,
    bucket: BUCKET,
    s3: s3,
    key: (req, file, cb) => {
      console.log(file)
      cb(null, file.originalname)
    }
  })
})

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  
  res.send('Successfully uploaded ' + req.file.location + 'location')
})

app.get('/list', async (req, res) => {
  let response = await s3.listObjectsV2({ Bucket: BUCKET}).promise()
  let output = response.Contents.map(item => item.Key)  

  res.send(output)
})

app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename
  let output = await s3.getObject({ Bucket: BUCKET, Key: filename }).promise()
  
  res.send(output.Body)
})

app.delete('/delete/:filename', async (req, res) => {
  const filename = req.params.filename
  await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise()

  res.send('File deleted successefully')
})


app.listen(3001, () => {
  console.log('Server is running on port 3001')
})