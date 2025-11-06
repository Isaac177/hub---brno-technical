// User Data Request Consumer Types

export interface UserDataRequestMessage {
  userId: string;
  eventType: 'USER_DATA_REQUEST';
  requestId?: string;
  timestamp?: string;
}

export interface UserEnrollmentData {
  id: string;
  userId: string | null;
  userEmail: string | null;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD';
  progress: number | null;
  enrolledAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
  lastAccessedAt: Date;
  transactionId: string | null;
  amount: number | null;
  currency: string | null;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | null;
  certificate?: UserCertificateData | null;
  payments?: UserPaymentData[];
}

export interface UserCertificateData {
  id: string;
  issuedAt: Date;
  verificationCode: string | null;
  pdfUrl: string | null;
}

export interface UserPaymentData {
  id: string;
  amount: number | null;
  currency: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
  paymentMethod: string | null;
  transactionReference: string | null;
}

export interface UserCourseProgress {
  id: string;
  enrollmentId: string;
  courseId: string;
  userEmail: string;
  overallProgress: number;
  totalComponents: number;
  completedComponents: number;
  components: any; // JSON field
  componentProgress: any; // JSON field
  topicsProgress: any; // JSON field
  lastUpdated: Date;
}

export interface UserQuizProgress {
  id: string;
  enrollmentId: string;
  quizId: string;
  attempts: number;
  bestScore: number | null;
  passed: boolean;
  lastAttemptAt: Date | null;
}

export interface UserLearningStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  onHoldEnrollments: number;
  averageProgress: number;
  totalQuizAttempts: number;
  passedQuizzes: number;
  failedQuizzes: number;
  uniqueQuizzesTaken: number;
  quizSuccessRate: number;
  totalCertificates: number;
  totalPayments: number;
  totalAmountPaid: number;
  averageScore: number;
  learningStreak: number; // Days of consecutive learning activity
  lastActivityDate: Date | null;
}

export interface UserAchievements {
  firstEnrollment: Date | null;
  firstCompletion: Date | null;
  firstCertificate: Date | null;
  fastestCompletion: {
    courseId: string;
    duration: number; // days
  } | null;
  bestQuizScore: {
    quizId: string;
    score: number;
  } | null;
  streakRecord: {
    days: number;
    startDate: Date;
    endDate: Date;
  } | null;
}

export interface UserDataResponse {
  userId: string;
  serviceType: 'STUDENT_MANAGEMENT_SERVICE';
  timestamp: string;
  requestId?: string;
  learningStats: UserLearningStats;
  achievements: UserAchievements;
  enrollments: UserEnrollmentData[];
  courseProgress: UserCourseProgress[];
  quizProgress: UserQuizProgress[];
  recentActivity: UserActivitySummary[];
}

export interface UserActivitySummary {
  date: Date;
  activityType: 'ENROLLMENT' | 'PROGRESS_UPDATE' | 'QUIZ_ATTEMPT' | 'COMPLETION' | 'CERTIFICATE_EARNED';
  courseId: string;
  description: string;
  metadata?: any;
}

export interface UserDataError {
  userId: string;
  serviceType: 'STUDENT_MANAGEMENT_SERVICE';
  error: string;
  errorCode: 'USER_NOT_FOUND' | 'NO_ENROLLMENTS' | 'SERVICE_ERROR';
  timestamp: string;
}