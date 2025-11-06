-- Drop the unique constraint on userEmail
ALTER TABLE "Enrollment" DROP CONSTRAINT IF EXISTS "Enrollment_userEmail_key";

-- Add composite unique constraint on userEmail and courseId
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userEmail_courseId_key" UNIQUE ("userEmail", "courseId");
