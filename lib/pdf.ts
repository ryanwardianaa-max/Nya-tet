import { Transaction, formatRupiah } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (transactions: Transaction[], monthName: string, chartElementId: string) => {
  // Create a new PDF document (A4, portrait)
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFillColor(0, 102, 204); // Action Blue
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Laporan Keuangan Nya-tet - ${monthName}`, pageWidth / 2, 35, { align: 'center' });
  
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 80, { align: 'center' });

  // Calculate totals
  const totalIn = transactions.filter(t => t.tipe === 'pemasukan').reduce((a, b) => a + Number(b.jumlah), 0);
  const totalOut = transactions.filter(t => t.tipe === 'pengeluaran').reduce((a, b) => a + Number(b.jumlah), 0);
  const saldo = totalIn - totalOut;

  // Summary box
  doc.setDrawColor(224, 224, 224);
  doc.setFillColor(245, 245, 247);
  doc.roundedRect(40, 100, pageWidth - 80, 80, 8, 8, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Pemasukan:', 60, 125);
  doc.setTextColor(48, 209, 88); // Green
  doc.text(formatRupiah(totalIn), 200, 125);

  doc.setTextColor(50, 50, 50);
  doc.text('Total Pengeluaran:', 60, 145);
  doc.setTextColor(255, 55, 95); // Red
  doc.text(formatRupiah(totalOut), 200, 145);

  doc.setTextColor(50, 50, 50);
  doc.text('Saldo Bersih:', 60, 165);
  doc.setTextColor(0, 102, 204); // Blue
  doc.text(formatRupiah(saldo), 200, 165);

  let currentY = 200;

  // Capture Chart
  const chartEl = document.getElementById(chartElementId);
  if (chartEl) {
    try {
      const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = pageWidth - 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.text('Grafik Pengeluaran:', 40, currentY);
      
      doc.addImage(imgData, 'PNG', 40, currentY + 10, imgWidth, imgHeight);
      currentY += imgHeight + 40;
    } catch (e) {
      console.error('Error capturing chart:', e);
    }
  }

  // Draw Table Headers
  // Check if we need a new page for table
  if (currentY > 700) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFillColor(29, 29, 31);
  doc.rect(40, currentY, pageWidth - 80, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal', 50, currentY + 20);
  doc.text('Kategori', 120, currentY + 20);
  doc.text('Keterangan', 220, currentY + 20);
  doc.text('Pemasukan', 380, currentY + 20);
  doc.text('Pengeluaran', 480, currentY + 20);
  
  currentY += 30;

  // Draw Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  transactions.forEach((tx, i) => {
    if (currentY > 780) {
      doc.addPage();
      currentY = 40;
    }
    
    // Zebra striping
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(40, currentY, pageWidth - 80, 25, 'F');
    }

    const isIncome = tx.tipe === 'pemasukan';
    const dateStr = new Date(tx.created_at).toLocaleDateString('id-ID');
    
    doc.setTextColor(50, 50, 50);
    doc.text(dateStr, 50, currentY + 16);
    doc.text(tx.kategori.slice(0, 12), 120, currentY + 16);
    
    // Truncate keterangan if too long
    let ket = tx.keterangan;
    if (ket.length > 25) ket = ket.slice(0, 23) + '...';
    doc.text(ket, 220, currentY + 16);
    
    if (isIncome) {
      doc.setTextColor(48, 209, 88);
      doc.text(formatRupiah(Number(tx.jumlah)), 380, currentY + 16);
      doc.setTextColor(50, 50, 50);
      doc.text('-', 480, currentY + 16);
    } else {
      doc.setTextColor(50, 50, 50);
      doc.text('-', 380, currentY + 16);
      doc.setTextColor(255, 55, 95);
      doc.text(formatRupiah(Number(tx.jumlah)), 480, currentY + 16);
    }
    
    // draw line
    doc.setDrawColor(240, 240, 240);
    doc.line(40, currentY + 25, pageWidth - 40, currentY + 25);
    
    currentY += 25;
  });

  // Save PDF
  doc.save(`Nya-tet_Laporan_${monthName.replace(' ', '_')}.pdf`);
};
