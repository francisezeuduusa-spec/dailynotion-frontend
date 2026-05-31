import React, { useState } from 'react';
import { useAppState } from '../state';
import { Lock, FileCheck, Plus, Check, ChevronDown, ChevronUp, Trash2, Edit, AlertCircle, Sparkles } from 'lucide-react';
import { Template } from '../types';

export const DashboardTemplates: React.FC = () => {
  const {
    subscription,
    templates,
    saveTemplate,
    deleteTemplate,
    setDefaultTemplate,
    selectDefaultTemplateOnboarding,
    addToast
  } = useAppState();

  const isFree = subscription?.plan === 'free';

  // State controllers
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form states
  const [tmplName, setTmplName] = useState('');
  const [tmplBody, setTmplBody] = useState('');
  const [tmplIsDefault, setTmplIsDefault] = useState(true);

  // Collapse controllers
  const [isReferenceCollapsed, setIsReferenceCollapsed] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  // Open editor for brand-new template
  const handleOpenNew = () => {
    if (isFree) {
      addToast('Upgrade to Pro to create custom templates!', 'error');
      return;
    }
    setEditingTemplate(null);
    setTmplName('');
    setTmplBody(`# Daily Review — {{date}}

## ✅ Today's Actions (Tasks)
{{tasks_today}}

## 📢 Notes Compiled Today
{{notes_last_24h}}`);
    setTmplIsDefault(true);
    setIsEditorOpen(true);
  };

  // Open editor to edit existing custom template
  const handleOpenEdit = (tmpl: Template) => {
    setEditingTemplate(tmpl);
    setTmplName(tmpl.name);
    setTmplBody(tmpl.body);
    setTmplIsDefault(tmpl.is_default);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName.trim()) {
      addToast('Please enter a template name.', 'error');
      return;
    }
    await saveTemplate(tmplName.trim(), tmplBody, tmplIsDefault, editingTemplate?.id);
    setIsEditorOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };

  // Filter templates list
  const customTemplates = templates.filter((t) => t.is_custom);
  const systemTemplates = templates.filter((t) => !t.is_custom);

  return (
    <div className="flex flex-col gap-8 font-sans text-charcoal-text text-left selection:bg-sage-green selection:text-charcoal-text relative">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight mb-1 text-charcoal-text">
            Templates
          </h1>
          <p className="text-sm text-ash-gray font-medium font-sans">
            Customize the layouts of compiled pages with responsive placeholders.
          </p>
        </div>

        {!isFree && (
          <button
            onClick={handleOpenNew}
            className="bg-sage-green text-charcoal-text font-bold text-xs py-3 px-6 rounded-full hover:opacity-90 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            style={{ borderRadius: '100px' }}
          >
            <Plus size={14} className="stroke-[3]" />
            <span>New template</span>
          </button>
        )}
      </div>

      {/* FREE PLAN WARNING STICKY BANNER */}
      {isFree && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-6 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold block text-charcoal-text">Custom templates are a Pro feature</span>
              You are currently using the default layout template. Upgrade to Pro to customize placeholders, edit layouts, and compile personalized logs daily.
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('prototype-navigation');
              window.location.hash = '/dashboard/billing';
            }}
            className="bg-charcoal-text text-canvas-white text-xs font-bold py-2.5 px-5 rounded-full hover:opacity-95 transition-opacity cursor-pointer shrink-0 font-sans"
            style={{ borderRadius: '100px' }}
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* COLLAPSIBLE PLACEHOLDER LIST SPECIFICATION */}
      <div className="border border-whisper-gray rounded-xl overflow-hidden bg-canvas-white">
        <button
          onClick={() => setIsReferenceCollapsed(!isReferenceCollapsed)}
          className="w-full flex items-center justify-between bg-parchment py-3 px-5 text-left text-xs font-mono font-bold tracking-wider text-ash-gray border-b border-whisper-gray cursor-pointer"
        >
          <span className="uppercase">Available Placeholders Syntax Reference</span>
          {isReferenceCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!isReferenceCollapsed && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-whisper-gray font-mono font-semibold tracking-wider text-[10px] text-cloud-gray uppercase">
                  <th className="pb-2.5">Code Placeholder</th>
                  <th className="pb-2.5">SaaS Dynamic Output Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-whisper-gray/50 text-ash-gray leading-normal">
                <tr>
                  <td className="py-3 font-mono font-bold text-charcoal-text">{"{{date}}"}</td>
                  <td className="py-3">Resolves to today's completed visual timestamp e.g. "Wednesday, May 28, 2026".</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-charcoal-text">{"{{tasks_today}}"}</td>
                  <td className="py-3">Pulls all due/overdue items from the Tasks Database list, typeset as Notion checklist grids.</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-charcoal-text">{"{{notes_last_24h}}"}</td>
                  <td className="py-3">Aggregates text clips or draft notes captured recently in matching Notion tables.</td>
                </tr>
                <tr className="text-cloud-gray">
                  <td className="py-3 font-mono">{"{{meetings_today}}"}</td>
                  <td className="py-3 italic">Google Calendars meeting feed Integration — (Coming Soon)</td>
                </tr>
                <tr className="text-cloud-gray">
                  <td className="py-3 font-mono">{"{{habit_tracker}}"}</td>
                  <td className="py-3 italic">Custom habit checkbox grid — (Coming Soon)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER SAVED CUSTOM TEMPLATES */}
      {!isFree && (
        <div className="flex flex-col gap-5">
          <h3 className="font-serif text-lg font-semibold text-charcoal-text">
            Your Custom Templates ({customTemplates.length} / 10 limit)
          </h3>

          {customTemplates.length === 0 ? (
            <div className="border border-dashed border-cloud-gray rounded-xl p-8 text-center bg-canvas-white">
              <p className="text-xs text-ash-gray font-semibold">You haven't designed any custom templates yet.</p>
              <p className="text-[11px] text-cloud-gray mt-1">Click top right 'New template' to start writing layouts with custom keys.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-canvas-white border border-whisper-gray p-6 rounded-2xl flex flex-col justify-between shadow-sm relative"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal-text text-sm line-clamp-1">{tmpl.name}</span>
                        {tmpl.is_default && (
                          <span className="bg-sage-green text-charcoal-text text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm border border-sage-green/30">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <pre className="font-mono bg-parchment p-3.5 rounded-lg border border-whisper-gray text-[10px] leading-relaxed text-ash-gray h-36 overflow-y-auto whitespace-pre-wrap">
                      {tmpl.body}
                    </pre>
                  </div>

                  <div className="flex items-center gap-3.5 mt-5 border-t border-whisper-gray/70 pt-4">
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="text-xs font-semibold text-charcoal-text hover:text-ash-gray flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    
                    {!tmpl.is_default && (
                      <button
                        onClick={() => setDefaultTemplate(tmpl.id)}
                        className="text-xs font-semibold text-ash-gray hover:text-charcoal-text flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck size={12} />
                        <span>Set Default</span>
                      </button>
                    )}

                    {!tmpl.is_default && (
                      <button
                        onClick={() => setTemplateToDelete(tmpl)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SYSTEM BUILT-OUT DEFAULTS LIST */}
      <div className="flex flex-col gap-5">
        <h3 className="font-serif text-lg font-semibold text-charcoal-text">
          Built-in Default Templates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {systemTemplates.map((tmpl) => {
            const isUsing = tmpl.is_default && !customTemplates.some(ct => ct.is_default);
            return (
              <div
                key={tmpl.id}
                className={`bg-canvas-white border p-6 rounded-2xl flex flex-col justify-between shadow-sm relative transition-all ${
                  isUsing && !isFree ? 'border-sage-green shadow-md' : 'border-whisper-gray'
                } ${isFree ? 'opacity-85 pointer-events-none' : ''}`}
              >
                {isFree && (
                  <div className="absolute inset-0 bg-canvas-white/20 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center z-10">
                    <Lock size={16} className="text-ash-gray" />
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="font-semibold text-charcoal-text text-sm line-clamp-1">{tmpl.name}</span>
                    {isUsing && (
                      <span className="bg-sage-green text-charcoal-text text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border border-sage-green/30">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <pre className="font-mono bg-parchment p-3 rounded-lg border border-whisper-gray text-[10px] leading-relaxed text-ash-gray h-36 overflow-y-auto whitespace-pre-wrap">
                    {tmpl.body}
                  </pre>
                </div>

                {!isFree && (
                  <button
                    onClick={() => setDefaultTemplate(tmpl.id)}
                    disabled={isUsing}
                    className={`w-full text-center text-xs font-bold py-2 rounded-full mt-5 transition-colors cursor-pointer ${
                      isUsing
                        ? 'bg-sage-green text-charcoal-text font-bold cursor-default'
                        : 'bg-parchment text-ash-gray hover:bg-cloud-gray'
                    }`}
                    style={{ borderRadius: '100px' }}
                  >
                    {isUsing ? 'Currently Active' : 'Use layout'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TEMPLATE EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-charcoal-text/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-canvas-white border border-cloud-gray shadow-2xl rounded-2xl max-w-xl w-full p-6 md:p-8 animate-fade-in font-sans text-left">
            <h2 className="font-serif text-2xl font-bold text-charcoal-text mb-2">
              {editingTemplate ? 'Edit Custom Template' : 'Create Custom Template'}
            </h2>
            <p className="text-xs text-ash-gray mb-6">
              Write HTML/Markdown and append key bracket values where database actions compile.
            </p>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Template name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Core Review"
                  value={tmplName}
                  onChange={(e) => setTmplName(e.target.value)}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text"
                />
              </div>

              {/* Body Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Template body markup
                </label>
                <textarea
                  required
                  rows={12}
                  value={tmplBody}
                  onChange={(e) => setTmplBody(e.target.value)}
                  placeholder="# Morning review — {{date}}"
                  className="w-full bg-parchment border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 font-mono text-xs text-charcoal-text leading-relaxed whitespace-pre"
                />
              </div>

              {/* Default setup Checkbox */}
              <div className="flex items-center gap-2.5 mt-2">
                <input
                  type="checkbox"
                  id="set-as-default"
                  checked={tmplIsDefault}
                  onChange={(e) => setTmplIsDefault(e.target.checked)}
                  className="accent-sage-green w-4 h-4 cursor-pointer"
                />
                <label htmlFor="set-as-default" className="text-xs font-semibold text-ash-gray cursor-pointer">
                  Set as my primary default layout template
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 border-t border-whisper-gray pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="bg-canvas-white border border-whisper-gray text-ash-gray font-semibold text-xs py-2.5 px-6 rounded-full hover:bg-parchment cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sage-green text-charcoal-text font-bold text-xs py-2.5 px-6 rounded-full hover:opacity-95 cursor-pointer shadow-sm"
                  style={{ borderRadius: '100px' }}
                >
                  Save template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MINI-MODAL */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-charcoal-text/20 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-canvas-white border border-cloud-gray p-6 rounded-xl max-w-sm w-full shadow-xl">
            <h4 className="font-serif text-lg font-bold text-charcoal-text mb-2">Delete template?</h4>
            <p className="text-xs text-ash-gray mb-6 leading-relaxed">
              Are you sure you want to delete '<span className="font-semibold text-charcoal-text">{templateToDelete.name}</span>'? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3.5">
              <button
                onClick={() => setTemplateToDelete(null)}
                className="bg-canvas-white border border-whisper-gray text-ash-gray font-semibold text-xs px-4 py-2 hover:bg-parchment cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-canvas-white font-bold text-xs px-5 py-2 hover:bg-red-600 transition-colors cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardTemplates;
