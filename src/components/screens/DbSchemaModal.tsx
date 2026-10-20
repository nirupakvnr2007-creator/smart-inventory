import React, { useState } from 'react';
import { DATABASE_COLLECTIONS, MONGO_DB_NAME, CollectionSchema } from '../../data/dbSchemaDocumentation';

interface DbSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const DbSchemaModal: React.FC<DbSchemaModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [selectedCollection, setSelectedCollection] = useState<CollectionSchema>(
    DATABASE_COLLECTIONS.find((c) => c.name === 'products') || DATABASE_COLLECTIONS[0]
  );
  const [activeTab, setActiveTab] = useState<'fields' | 'json' | 'sql_comparison'>('fields');

  if (!isOpen) return null;

  const handleCopyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    onShowToast(`Sample JSON for "${selectedCollection.name}" copied! Ready for Compass Import.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col border border-[#dae2fd] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#eff4ff] border-b border-[#dae2fd] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#004f35] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-[17px] text-[#0b1c30]">
                  Database Collections Architecture
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-[#85f8c4] text-[#002114] text-[10px] font-bold">
                  MongoDB Compass
                </span>
              </div>
              <p className="text-[12px] text-[#565e74]">
                Target: <code className="font-mono text-[#0037b0] font-bold">localhost:27017/{MONGO_DB_NAME}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#dce1ff] text-[#434655] flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body: Sidebar Collections + Main Schema Explorer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Collections List */}
          <div className="w-56 bg-[#f8f9ff] border-r border-[#dae2fd] p-2 overflow-y-auto space-y-1">
            <span className="px-2 py-1 text-[10px] font-bold text-[#747686] uppercase tracking-wider block">
              Collections (Tables)
            </span>
            {DATABASE_COLLECTIONS.map((col) => {
              const isSelected = selectedCollection.name === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => setSelectedCollection(col)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0037b0] text-white shadow-xs'
                      : 'text-[#434655] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[15px]">
                      {col.name === 'products'
                        ? 'shelves'
                        : col.name === 'users'
                        ? 'person'
                        : col.name === 'shops'
                        ? 'storefront'
                        : col.name === 'transactions'
                        ? 'receipt_long'
                        : 'folder'}
                    </span>
                    <span className="truncate">{col.name}</span>
                  </div>
                  {col.name === 'products' && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#dce1ff] text-[#001551]'
                      }`}
                    >
                      Compass Tab
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Main Panel */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
            {/* Collection Title & Description */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-headline font-bold text-[18px] text-[#0b1c30]">
                    collection: <span className="text-[#0037b0]">{selectedCollection.name}</span>
                  </h4>
                  <span className="text-[11px] bg-[#eff4ff] border border-[#dae2fd] text-[#565e74] px-2 py-0.2 rounded font-mono">
                    {selectedCollection.fields.length} fields
                  </span>
                </div>
                <p className="text-[12px] text-[#565e74] mt-0.5">
                  {selectedCollection.description}
                </p>
              </div>

              {/* Copy Sample JSON button */}
              <button
                onClick={() => handleCopyJson(selectedCollection.sampleDocument)}
                className="px-3 py-1.5 rounded-lg bg-[#eff4ff] border border-[#dae2fd] text-[#0037b0] hover:bg-[#dce1ff] text-[12px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy JSON for Compass</span>
              </button>
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-2 border-b border-[#eff4ff] pb-2">
              <button
                onClick={() => setActiveTab('fields')}
                className={`text-[12px] font-bold pb-1 cursor-pointer transition-colors ${
                  activeTab === 'fields'
                    ? 'text-[#0037b0] border-b-2 border-[#0037b0]'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                Field Schema &amp; Types
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`text-[12px] font-bold pb-1 cursor-pointer transition-colors ${
                  activeTab === 'json'
                    ? 'text-[#0037b0] border-b-2 border-[#0037b0]'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                Sample JSON Document
              </button>
              <button
                onClick={() => setActiveTab('sql_comparison')}
                className={`text-[12px] font-bold pb-1 cursor-pointer transition-colors ${
                  activeTab === 'sql_comparison'
                    ? 'text-[#0037b0] border-b-2 border-[#0037b0]'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                SQL vs MongoDB Mapping
              </button>
            </div>

            {/* Tab 1: Field Schema */}
            {activeTab === 'fields' && (
              <div className="space-y-3">
                <div className="border border-[#e5eeff] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#eff4ff] text-[#565e74] font-bold border-b border-[#dae2fd]">
                      <tr>
                        <th className="p-2.5">Field</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Required</th>
                        <th className="p-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eff4ff]">
                      {selectedCollection.fields.map((f) => (
                        <tr key={f.name} className="hover:bg-[#f8f9ff]">
                          <td className="p-2.5 font-mono font-bold text-[#0b1c30]">{f.name}</td>
                          <td className="p-2.5 font-mono text-[#0037b0]">{f.type}</td>
                          <td className="p-2.5">
                            {f.required ? (
                              <span className="text-[#ba1a1a] font-bold">Yes</span>
                            ) : (
                              <span className="text-[#747686]">Optional</span>
                            )}
                          </td>
                          <td className="p-2.5 text-[#565e74]">{f.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recommended Indexes */}
                <div className="p-3 bg-[#e5eeff] rounded-xl border border-[#dae2fd] text-[12px] space-y-1">
                  <span className="font-bold text-[#0b1c30] block">Recommended Indexes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCollection.indexes.map((idx, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white font-mono text-[11px] text-[#0037b0] border border-[#dae2fd]"
                      >
                        {idx}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sample JSON */}
            {activeTab === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#565e74]">
                  <span>Paste this into MongoDB Compass via "Import data" $\rightarrow$ "JSON":</span>
                  <button
                    onClick={() => handleCopyJson(selectedCollection.sampleDocument)}
                    className="text-[#0037b0] font-bold hover:underline"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <pre className="p-3 bg-[#0b1c30] text-[#85f8c4] rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#213145]">
                  {JSON.stringify(selectedCollection.sampleDocument, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab 3: SQL vs MongoDB Mapping */}
            {activeTab === 'sql_comparison' && (
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dae2fd] text-[12px] space-y-2 leading-relaxed">
                <h5 className="font-bold text-[#0b1c30]">
                  How Relational SQL Tables map to MongoDB:
                </h5>
                <ul className="space-y-1 text-[#434655] list-disc pl-4">
                  <li>
                    <strong>Database</strong>: <code className="font-mono text-[#0037b0]">smart_inventory</code> is created in MongoDB Compass as shown in your screenshot.
                  </li>
                  <li>
                    <strong>Tables $\rightarrow$ Collections</strong>: In MongoDB, tables are called <em>Collections</em>. You can click the <strong>"+"</strong> button in Compass next to "smart_inventory" to create:
                    <div className="flex flex-wrap gap-1.5 my-1 font-mono text-[11px] text-[#004f35]">
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">products</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">users</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">shops</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">transactions</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">restock_orders</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">reviews</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">forum_posts</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-[#c4c5d7]">recommendations</span>
                    </div>
                  </li>
                  <li>
                    <strong>Rows $\rightarrow$ Documents</strong>: In MongoDB Compass, each row is a BSON / JSON document containing the fields above.
                  </li>
                  <li>
                    <strong>Columns $\rightarrow$ Fields</strong>: Flexible document keys allowing nested data (e.g., transaction items list or forum replies).
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#eff4ff] border-t border-[#dae2fd] flex items-center justify-between text-[12px]">
          <span className="text-[#565e74]">
            Compass Host: <strong>localhost:27017</strong> • Database: <strong>smart_inventory</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0037b0] text-white font-bold cursor-pointer hover:bg-[#1d4ed8]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
