import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


export const generatePDF = async (user: any, course: any, verificationCode: string) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('Certificate of Completion', { x: 50, y: 350, size: 30, font });
    page.drawText(`This is to certify that`, { x: 50, y: 300, size: 14, font });
    page.drawText(`${user.firstName} ${user.lastName}`, { x: 50, y: 270, size: 20, font });
    page.drawText(`has successfully completed the course`, { x: 50, y: 240, size: 14, font });
    page.drawText(`${course.translations[0].title}`, { x: 50, y: 210, size: 20, font });
    page.drawText(`Verification Code: ${verificationCode}`, { x: 50, y: 50, size: 10, font });

    return pdfDoc.save();
};

export const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
