import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import { S3_BUCKET } from '@/config';

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploader = (folder: string) =>
  multer({
    storage: multerS3({
      s3: new aws.S3(),
      bucket: S3_BUCKET,
      acl: 'public-read',
      key: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = `${folder}/${fileName}`;
        cb(null, filePath);
      }
    })
  });
