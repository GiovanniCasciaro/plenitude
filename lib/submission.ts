export function getSubmissionExcelDownloadUrl(submission: { id: string }) {
  return `/api/admin/export/file?id=${submission.id}`;
}
