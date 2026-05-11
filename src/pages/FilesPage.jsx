import { FileWarning, FolderOpen, Upload } from "lucide-react";

export default function FilesPage({
  files,
  onOpenFile,
  onUpload,
  themeClasses,
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">Uploaded Files</h2>
          <p className={`${themeClasses.muted} mt-1`}>
            Browse recently uploaded .log files and reopen their parsed entries.
          </p>
        </div>

        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-2xl font-semibold transition"
        >
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <div
        className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
      >
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <h3 className="text-xl font-semibold">Recent Uploads</h3>
        </div>

        {files.length > 0 ? (
          <div className={`divide-y ${themeClasses.divider}`}>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onOpenFile(file)}
                className={`w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 text-left transition ${themeClasses.rowHover}`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-2xl">
                    <FileWarning size={22} />
                  </div>

                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className={`text-sm ${themeClasses.muted} mt-1`}>
                      {file.entryCount} entries parsed
                    </p>
                  </div>
                </div>

                <div className={`text-sm ${themeClasses.muted} md:text-right`}>
                  <p>{formatFileSize(file.size)}</p>
                  <p className="mt-1">{file.uploadedAt}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <FolderOpen
              className={`mx-auto mb-4 ${themeClasses.emptyIcon}`}
              size={42}
            />
            <p className="text-lg font-semibold">No uploaded files yet</p>
            <p className={`mt-2 ${themeClasses.muted}`}>
              Upload a .log file to see it listed here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
