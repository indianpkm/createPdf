import express from 'express'
import upload from '../utils/upload.js';
import { getImage, uploadFile } from '../controller/image-controller.js';
const route=express.Router();

route.post('/file/upload',upload.single('file'), uploadFile)
route.get('/file/:filename',getImage)

export default route;