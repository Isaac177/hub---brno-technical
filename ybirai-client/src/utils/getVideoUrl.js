export const getVideoUrl = (key) => {
  if (!key) return null;
  if (key.startsWith('http')) return key;

  const S3_BUCKET_URL = 'https://quralay-course.s3.ap-south-1.amazonaws.com/';

  // For course videos stored in temp directories, keep the temp path
  if (key.startsWith('temp/')) {
    return `${S3_BUCKET_URL}${key}`;
  }

  // For other files, convert to files directory
  const finalKey = key.replace('temp/', 'files/');
  return `${S3_BUCKET_URL}${finalKey}`;
};