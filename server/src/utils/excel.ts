import ExcelJS from 'exceljs';
import { Response } from 'express';

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExcelSection {
  title: string;
  columns: ExcelColumn[];
  rows: Record<string, any>[];
}

export async function createExcelWorkbook(sections: ExcelSection[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BOQ AI';
  workbook.created = new Date();

  for (const section of sections) {
    const worksheet = workbook.addWorksheet(section.title, {
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    worksheet.columns = section.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    section.rows.forEach((row) => {
      worksheet.addRow(row);
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: section.rows.length + 1, column: section.columns.length },
    };
  }

  return workbook;
}

export async function streamExcel(
  workbook: ExcelJS.Workbook,
  res: Response,
  filename: string
): Promise<void> {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}
