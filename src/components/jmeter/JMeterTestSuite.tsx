import React, { useState } from 'react';
import { Download, Upload, Terminal, AlertCircle } from 'lucide-react';

interface CsvSample {
  timeStamp: string;
  elapsed: number;
  label: string;
  responseCode: string;
  responseMessage: string;
  threadName: string;
  success: boolean;
}

export const JMeterTestSuite: React.FC = () => {
  const [results, setResults] = useState<CsvSample[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing data rows.');
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const elapsedIdx = headers.indexOf('elapsed');
        const codeIdx = headers.indexOf('responseCode');
        const msgIdx = headers.indexOf('responseMessage');
        const labelIdx = headers.indexOf('label');
        const threadIdx = headers.indexOf('threadName');
        const successIdx = headers.indexOf('success');
        const timeIdx = headers.indexOf('timeStamp');

        if (codeIdx === -1 || elapsedIdx === -1) {
          throw new Error('CSV must contain at least "elapsed" and "responseCode" headers.');
        }

        const parsed: CsvSample[] = lines.slice(1).map((line) => {
          const cols = line.split(',');
          return {
            timeStamp: timeIdx !== -1 ? cols[timeIdx] : '',
            elapsed: Number(cols[elapsedIdx]) || 0,
            label: labelIdx !== -1 ? cols[labelIdx] : 'HTTP Request',
            responseCode: cols[codeIdx] || '',
            responseMessage: msgIdx !== -1 ? cols[msgIdx] : '',
            threadName: threadIdx !== -1 ? cols[threadIdx] : '',
            success: successIdx !== -1 ? cols[successIdx]?.toLowerCase() === 'true' : Number(cols[codeIdx]) < 400,
          };
        });

        setResults(parsed);
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV file');
        setResults(null);
      }
    };
    reader.readAsText(file);
  };

  const total = results ? results.length : 0;
  const successes = results ? results.filter((r) => r.success).length : 0;
  const errors = total - successes;
  const avgElapsed = total > 0 ? Math.round(results!.reduce((acc, r) => acc + r.elapsed, 0) / total) : 0;
  const minElapsed = total > 0 ? Math.min(...results!.map((r) => r.elapsed)) : 0;
  const maxElapsed = total > 0 ? Math.max(...results!.map((r) => r.elapsed)) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-stone-900">JMeter Load &amp; Concurrency Testing</h2>
        <p className="text-sm text-stone-600 mt-1">
          Execute Apache JMeter on your local machine using our test plan, then upload your actual test results (.csv or .jtl) here to inspect metrics.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/jmeter/UCRMS_Load_and_Concurrency_TestPlan.jmx"
            download="UCRMS_Load_and_Concurrency_TestPlan.jmx"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded transition-colors"
          >
            <Download className="w-4 h-4 text-stone-600" />
            Download JMeter Test Plan (.jmx)
          </a>

          <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>{fileName ? `Loaded: ${fileName}` : 'Upload Test Results (.csv / .jtl)'}</span>
            <input type="file" accept=".csv,.jtl" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {parseError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{parseError}</span>
        </div>
      )}

      {/* When Results Are Uploaded */}
      {results && results.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Total Samples</div>
              <div className="text-2xl font-semibold text-stone-900 mt-1">{total}</div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Success / Error</div>
              <div className="text-2xl font-semibold text-stone-900 mt-1">
                <span className="text-emerald-700">{successes}</span> / <span className="text-red-700">{errors}</span>
              </div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Avg Response Time</div>
              <div className="text-2xl font-semibold text-stone-900 mt-1">{avgElapsed} ms</div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Min / Max Response</div>
              <div className="text-2xl font-semibold text-stone-900 mt-1">{minElapsed} / {maxElapsed} ms</div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 font-medium text-xs text-stone-700 bg-stone-50">
              Sample Execution Traces ({results.length} total)
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Label</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Elapsed</th>
                    <th className="py-2 px-3">Thread Name</th>
                    <th className="py-2 px-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {results.slice(0, 100).map((sample, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 font-mono text-stone-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium">{sample.label}</td>
                      <td className="py-2 px-3 font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          sample.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {sample.responseCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono">{sample.elapsed} ms</td>
                      <td className="py-2 px-3 text-stone-500 truncate max-w-xs">{sample.threadName}</td>
                      <td className="py-2 px-3 text-stone-500 truncate max-w-sm">{sample.responseMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-stone-600" />
            How to run JMeter locally
          </h3>
          <ol className="list-decimal list-inside text-xs text-stone-600 space-y-2">
            <li>Download the test plan above: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">UCRMS_Load_and_Concurrency_TestPlan.jmx</code>.</li>
            <li>Make sure your UCRMS server is running on <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">http://localhost:3000</code>.</li>
            <li>Run JMeter from terminal:
              <div className="mt-1 p-2 bg-stone-900 text-stone-200 font-mono text-xs rounded select-all">
                jmeter -n -t UCRMS_Load_and_Concurrency_TestPlan.jmx -l results.csv
              </div>
            </li>
            <li>Click <strong>Upload Test Results</strong> above and select your generated <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">results.csv</code> file.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
