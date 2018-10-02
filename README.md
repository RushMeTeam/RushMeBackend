# Backend

1. Static Content:
  Static Content can be stored in S3 using JSON Object for text and .zip files
  which will hold compressed image files we need to distribute.

2. Static Content Changes:
  We will use API Gateway to call a Lambda function to compress and transform
  input files from the admin and store them in S3 according to our model.

3. User Data Storage:
  We can use Amazon Cogntio User Pools to store user data, this feature will
  take some help from iOS and Android teams to integrate.
