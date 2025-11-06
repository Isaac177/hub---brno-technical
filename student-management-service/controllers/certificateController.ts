import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors';

import {generatePDF, generateVerificationCode} from "../utils/generators";
import {findUserByEmail} from "../utils/findUserByEmail";
import {findCourseById} from "../utils/findCourseById";


const prisma = new PrismaClient();

interface GenerateCertificateBody {
    enrollmentId: string;
}

export const generateCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { enrollmentId }: GenerateCertificateBody = req.body;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
        });

        if (!enrollment) {
            throw new NotFoundError(req.t('enrollment.notFound'));
        }

        if (enrollment.status !== 'COMPLETED') {
            throw new BadRequestError(req.t('certificate.courseNotCompleted'));
        }

        const user: any = findUserByEmail(enrollment.userEmail);
        if (!user) {
            throw new NotFoundError(req.t('user.notFound'));
        }

        const course: any = findCourseById(enrollment.courseId);
        if (!course) {
            throw new NotFoundError(req.t('course.notFound'));
        }

        const verificationCode = generateVerificationCode();
        const pdfBuffer = await generatePDF(user, course, verificationCode);

        const pdfUrl = `https://example.com/certificates/${verificationCode}.pdf`;

        const certificate = await prisma.certificate.create({
            data: {
                enrollmentId,
                pdfUrl,
                verificationCode,
            },
        });

        res.status(201).json({
            message: req.t('certificate.generateSuccess'),
            certificate: {
                id: certificate.id,
                enrollmentId: certificate.enrollmentId,
                issuedAt: certificate.issuedAt,
                pdfUrl: certificate.pdfUrl,
                verificationCode: certificate.verificationCode,
                studentName: `${user.firstName} ${user.lastName}`,
                courseTitle: course.translations[0].title,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const listCertificates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userEmail, page = 1, limit = 10 } = req.query;

        const whereClause: any = {};
        if (userEmail) {
            whereClause.enrollment = { userEmail: userEmail };
        }

        const certificates = await prisma.certificate.findMany({
            where: whereClause,
            include: { enrollment: true },
            orderBy: { issuedAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });

        const enrichedCertificates = await Promise.all(certificates.map(async (cert) => {
            const user: any = findUserByEmail(cert.enrollment.userEmail);
            const course: any = findCourseById(cert.enrollment.courseId);
            return {
                id: cert.id,
                issuedAt: cert.issuedAt,
                pdfUrl: cert.pdfUrl,
                verificationCode: cert.verificationCode,
                studentName: user ? `${user.firstName} ${user.lastName}` : req.t('unknown'),
                courseTitle: course ? course.translations[0].title : req.t('certificate.unknownCourse'),
            };
        }));

        res.status(200).json({ certificates: enrichedCertificates });
    } catch (error) {
        next(error);
    }
};

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { verificationCode } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { verificationCode },
            include: { enrollment: true },
        });

        if (!certificate) {
            throw new NotFoundError(req.t('certificate.notFound'));
        }

        const user: any = findUserByEmail(certificate.enrollment.userEmail);
        const course: any = findCourseById(certificate.enrollment.courseId);

        res.status(200).json({
            isValid: true,
            certificate: {
                id: certificate.id,
                issuedAt: certificate.issuedAt,
                studentName: user ? `${user.firstName} ${user.lastName}` : req.t('unknown'),
                courseTitle: course ? course.translations[0].title : req.t('certificate.unknownCourse'),
            },
        });
    } catch (error) {
        next(error);
    }
};
