/** Télécharge un PDF démo minimal (frontend only). */
export function downloadDemoPdf(fileName: string, title: string) {
  const safeTitle = title.replace(/[()\\]/g, ' ').slice(0, 80)
  const stream = `BT /F1 16 Tf 50 720 Td (${safeTitle}) Tj ET`
  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length ${stream.length} >>stream
${stream}
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
trailer<< /Root 1 0 R >>
%%EOF`

  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}
