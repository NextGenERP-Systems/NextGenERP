export default function TemplatesList() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
          <p className="text-muted-foreground">Manage templates for automated document generation.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          New Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">Standard Offer Letter</h3>
          <p className="text-sm text-gray-500 mb-4">HR standard employment offer template.</p>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">HR Module</span>
        </div>
        <div className="border rounded-lg p-6 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">NDA Agreement</h3>
          <p className="text-sm text-gray-500 mb-4">Non-Disclosure Agreement for vendors.</p>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Legal</span>
        </div>
      </div>
    </div>
  );
}
