import { useState } from 'react';
import axiosInstance from '../api/axios';

const ApiDebug = () => {
  const [output, setOutput] = useState<string | null>(null);
  const runTest = async () => {
    setOutput('Running tests...');
    const results: any = {};
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    results.local = { token: token ? 'present' : 'missing', role };

    const endpoints = ['/machines', '/clients', '/interventions'];
    for (const ep of endpoints) {
      try {
        const res = await axiosInstance.get(ep);
        results[`auth${ep}`] = { status: res.status, data: res.data, requestHeaders: res.config?.headers };
      } catch (e: any) {
        results[`auth${ep}`] = { error: e.response?.status, body: e.response?.data };
      }

      try {
        const axios = await import('axios').then((m) => m.default);
        const resUnauth = await axios.get(`/api${ep}`);
        results[`unauth${ep}`] = { status: resUnauth.status, data: resUnauth.data, requestHeaders: resUnauth.config?.headers };
      } catch (e: any) {
        results[`unauth${ep}`] = { error: e.response?.status, body: e.response?.data };
      }
    }

    setOutput(JSON.stringify(results, null, 2));
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="hidden sm:flex sm:items-center sm:space-x-2 mr-4">
      <button
        onClick={runTest}
        className="inline-flex items-center px-3 py-2 text-sm font-medium border rounded-lg bg-gray-50 hover:bg-gray-100"
      >
        API Test
      </button>
      {output && (
        <div className="ml-3 text-xs font-mono bg-white p-2 rounded border max-w-md max-h-64 overflow-auto">
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebug;
