import { Request, Response, NextFunction } from "express";
import { EnrollmentStatus } from "@prisma/client";
import { BadRequestError } from "../utils/errors";
import { SchoolService } from "../services/schoolService";

export class SchoolController {
  private schoolService: SchoolService;

  constructor() {
    this.schoolService = new SchoolService();
  }

  getSchoolStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { schoolId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as EnrollmentStatus;

      if (!schoolId) {
        throw new BadRequestError('School ID is required');
      }

      const result = await this.schoolService.getSchoolStudents({
        schoolId,
        page,
        limit,
        status,
        messageQueue: req.app.messageQueue
      });

      res.status(200).json({
        success: true,
        data: result.students,
        meta: {
          total: result.totalCount,
          page,
          limit,
          pages: Math.ceil(result.totalCount / limit),
          schoolId
        }
      });

    } catch (error) {
      console.error('[SchoolController.getSchoolStudents] Error:', error);
      next(error);
    }
  };
}

export const schoolController = new SchoolController();