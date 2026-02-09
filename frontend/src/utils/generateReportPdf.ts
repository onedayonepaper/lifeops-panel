import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function generateReportPdf(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pdfWidth
  const imgHeight = (canvas.height * pdfWidth) / canvas.width

  const finalHeight = Math.min(imgHeight, pdfHeight)
  const finalWidth = imgHeight > pdfHeight
    ? (canvas.width * pdfHeight) / canvas.height
    : imgWidth

  const x = (pdfWidth - finalWidth) / 2

  pdf.addImage(imgData, 'PNG', x, 0, finalWidth, finalHeight)

  return pdf.output('blob')
}
