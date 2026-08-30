export default function DocumentsList() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">View, manage, and share documents.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create Document
        </button>
      </div>
      
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Document Number</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-white hover:bg-gray-50">
              <td className="px-6 py-4">DOC-12345</td>
              <td className="px-6 py-4 font-medium">Software License Agreement</td>
              <td className="px-6 py-4">Contract</td>
              <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending Approval</span></td>
              <td className="px-6 py-4">jane.doe</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
