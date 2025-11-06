import express from 'express';
import {generateCertificate, listCertificates, verifyCertificate} from "../controllers/certificateController";

const router = express.Router();


router.post('/certificates', generateCertificate);

router.get('/certificates', listCertificates);

router.get('/certificates/:id/verify', verifyCertificate);

export default router;
