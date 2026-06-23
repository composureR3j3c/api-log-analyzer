import { getEmptyLogMessage } from "../utils/getEmptyLogMessage";

export function LogsTable({
  logs, getBadgeColor, hasSearch, themeClasses, totalLogCount, setSelectedLog,
}) {
  return (
    <div
      className={`border rounded-3xl overflow-hidden ${themeClasses.panel} ${themeClasses.border}`}
    >
      <div className={`p-6 border-b ${themeClasses.border}`}>
        <h3 className="text-xl font-semibold">Recent AI Detected Incidents</h3>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className={`${themeClasses.tableHead} text-sm`}>
            <tr>
              <th className="text-left p-5">Severity</th>
              <th className="text-left p-5">Service</th>
              <th className="text-left p-5">Message</th>
              <th className="text-left p-5">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-t transition ${themeClasses.rowBorder} ${themeClasses.rowHover}`}
                >
                  <td className="p-5 ">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getBadgeColor(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                  </td>

                  <td className="p-5">{log.service}</td>

                  <td className="p-5 max-w-sm truncate
                  ">{log.message}</td>


                  <td className={`p-5 ${themeClasses.muted}`}>{log.time}</td>
                  <td className="p-5 text-right">
                    <button name="view-log" className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition"

                      onClick={() => setSelectedLog(log)}>
                      View Log
                    </button>
                  </td>
                </tr>

              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className={`border-t p-8 text-center ${themeClasses.rowBorder} ${themeClasses.muted}`}
                >
                  {getEmptyLogMessage(hasSearch, totalLogCount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
