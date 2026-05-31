import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Transaction, formatRupiah } from './types';

export const exportToExcel = async (transactions: Transaction[], monthName: string) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Laporan Keuangan');

  // Title
  sheet.mergeCells('A1:F1');
  sheet.getCell('A1').value = `Laporan Keuangan Nya-tet - ${monthName}`;
  sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
  sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 35;

  sheet.mergeCells('A2:F2');
  sheet.getCell('A2').value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
  sheet.getCell('A2').font = { size: 11, italic: true };
  sheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

  // Spacing
  sheet.addRow([]);

  // Calculate totals
  const totalIn = transactions.filter(t => t.tipe === 'pemasukan').reduce((a, b) => a + Number(b.jumlah), 0);
  const totalOut = transactions.filter(t => t.tipe === 'pengeluaran').reduce((a, b) => a + Number(b.jumlah), 0);
  const saldo = totalIn - totalOut;

  // Summary Table
  sheet.getCell('B4').value = 'Total Pemasukan';
  sheet.getCell('B4').font = { bold: true };
  sheet.getCell('C4').value = totalIn;
  sheet.getCell('C4').numFmt = 'Rp #,##0';
  sheet.getCell('C4').font = { bold: true, color: { argb: 'FF30D158' } };

  sheet.getCell('B5').value = 'Total Pengeluaran';
  sheet.getCell('B5').font = { bold: true };
  sheet.getCell('C5').value = totalOut;
  sheet.getCell('C5').numFmt = 'Rp #,##0';
  sheet.getCell('C5').font = { bold: true, color: { argb: 'FFFF375F' } };

  sheet.getCell('B6').value = 'Saldo Bersih';
  sheet.getCell('B6').font = { bold: true };
  sheet.getCell('C6').value = saldo;
  sheet.getCell('C6').numFmt = 'Rp #,##0';
  sheet.getCell('C6').font = { bold: true, color: { argb: 'FF0066CC' } };

  sheet.addRow([]);
  sheet.addRow([]);

  // Data Headers
  const headerRow = sheet.addRow(['Tanggal', 'Kategori', 'Keterangan', 'Tipe', 'Pemasukan', 'Pengeluaran']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.height = 25;
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D1D1F' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Data Rows
  transactions.forEach((tx) => {
    const isIncome = tx.tipe === 'pemasukan';
    const row = sheet.addRow([
      new Date(tx.created_at).toLocaleDateString('id-ID'),
      tx.kategori,
      tx.keterangan,
      isIncome ? 'Pemasukan' : 'Pengeluaran',
      isIncome ? Number(tx.jumlah) : 0,
      !isIncome ? Number(tx.jumlah) : 0,
    ]);
    
    // Formatting currency cells
    row.getCell(5).numFmt = 'Rp #,##0';
    if (isIncome) row.getCell(5).font = { color: { argb: 'FF30D158' } };
    
    row.getCell(6).numFmt = 'Rp #,##0';
    if (!isIncome) row.getCell(6).font = { color: { argb: 'FFFF375F' } };

    // Align dates and categories
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'center' };
  });

  // Borders
  const startRow = 9;
  const endRow = startRow + transactions.length;
  for (let r = startRow; r <= endRow; r++) {
    sheet.getRow(r).eachCell({ includeEmpty: false }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  }

  // Column Widths
  sheet.getColumn(1).width = 15;
  sheet.getColumn(2).width = 20;
  sheet.getColumn(3).width = 35;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 20;
  sheet.getColumn(6).width = 20;

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Nya-tet_Laporan_${monthName.replace(' ', '_')}.xlsx`);
};
