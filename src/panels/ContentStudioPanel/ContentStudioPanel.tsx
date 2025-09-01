import React, { useState, useEffect } from 'react';
import { ContentType, getSchema, validateContent, ValidationResult, checkFieldDependency } from '../../services/ContentSchema';
import { contentValidationService } from '../../services/ContentValidationService';
import { contentImportExportService, ContentTemplate } from '../../services/ContentImportExportService';
import { moveIndexService } from '../../services/MoveIndexService';
import { Panel, PanelMetadata } from '../../framework/Panel';
import './ContentStudioPanel.css';

interface ContentStudioPanelProps {
  // Add unknown props as needed
}

interface FormData {
  [key: string]: unknown;
}

const ContentStudioPanel: React.FC < ContentStudioPanelProps> = () => {
  const [contentType, setContentType] = useState < ContentType>('move');
  const [formData, setFormData] = useState < FormData>({});
  const [validationResult, setValidationResult] = useState < ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [customContent, setCustomContent] = useState<{ moves: unknown[], items: unknown[], spells: unknown[] }>({
    moves: [],
    items: [],
    spells: [],
  });
  const [showImportExport, setShowImportExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [importResult, setImportResult] = useState < unknown>(null);
  const [exportData, setExportData] = useState < string>('');

  const schema = getSchema(contentType);

  useEffect(() => {
    // Initialize form data with default values
    const defaultData: FormData = {};
    schema.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue;
      }
    });
    setFormData(defaultData);
  }, [contentType]);

  // Load custom content from localStorage on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('customContent');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        setCustomContent(parsed);
      }
    } catch (error) {
      }
  }, []);

  useEffect(() => {
    // Validate form data when it changes
    if (Object.keys(formData).length > 0) {
      const result = contentValidationService.validateContent(formData, contentType);
      setValidationResult(result);
    }
  }, [formData, contentType]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    const result = contentValidationService.validateContent(formData, contentType);
    setValidationResult(result);

    if (result.isValid) {
      const newContent = { ...formData };

      setCustomContent(prev => {
        const updated = {
          ...prev,
          [contentType + 's']: [...prev[contentType + 's' as keyof typeof prev], newContent],
        };

        // Save to localStorage
        localStorage.setItem('customContent', JSON.stringify(updated));

        return updated;
      });

      // Refresh move index if this is a move
      if (contentType === 'move') {
        moveIndexService.refreshCustomContent();
      }

      // Reset form
      const defaultData: FormData = {};
      schema.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultData[field.name] = field.defaultValue;
        }
      });
      setFormData(defaultData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    const defaultData: FormData = {};
    schema.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue;
      }
    });
    setFormData(defaultData);
    setIsEditing(false);
  };

  const handleExport = () => {
    const contentList = customContent[contentType + 's' as keyof typeof customContent] as string[];
    const exportJson = contentImportExportService.exportContent(contentList, contentType, {
      name: `Custom ${contentType}s`,
      description: `Exported ${contentType}s from Content Studio`,
      author: 'User',
      tags: [contentType, 'custom'],
    });
    setExportData(exportJson);
    setShowImportExport(true);
  };

  const handleImport = (jsonData: string) => {
    const contentList = customContent[contentType + 's' as keyof typeof customContent] as string[];
    const result = contentImportExportService.importContent(jsonData, contentList);
    setImportResult(result);

    if (result.success && result.content) {
      setCustomContent(prev => {
        const updated = {
          ...prev,
          [contentType + 's']: [...prev[contentType + 's' as keyof typeof prev], ...result.content!],
        };

        // Save to localStorage
        localStorage.setItem('customContent', JSON.stringify(updated));

        return updated;
      });

      // Refresh move index if this is a move
      if (contentType === 'move') {
        moveIndexService.refreshCustomContent();
      }
    }
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    const templateContent = contentImportExportService.createFromTemplate(template.id);
    setFormData(templateContent);
    setIsEditing(true);
    setShowTemplates(false);
  };

  const renderField = (field: unknown) => {
    const value = formData[field.name] || '';
    const fieldErrors = validationResult.errors.filter(e => e.field === field.name);
    const fieldWarnings = validationResult.warnings.filter(w => w.field === field.name);

    // Check field dependency
    const isFieldVisible = checkFieldDependency(field, formData);
    if (!isFieldVisible) return null;

    switch (field.type) {
      case 'string':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.name}
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`field-input ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error.message}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-warning">{warning.message}</div>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`field-textarea ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
              rows={4}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error.message}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-warning">{warning.message}</div>
            ))}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
              className={`field-input ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error.message}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-warning">{warning.message}</div>
            ))}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`field-select ${fieldErrors.length > 0 ? 'error' : ''}`}
            >
              {field.options?.map((option: unknown) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error.message}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-warning">{warning.message}</div>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.name} className="form-field">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="multiselect-container">
              {field.options?.map((option: unknown) => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error.message}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-warning">{warning.message}</div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderContentList = () => {
    const contentList = customContent[contentType + 's' as keyof typeof customContent] as string[];

    if (contentList.length === 0) {
      return < div className="empty-state">No custom {contentType}s created yet.</div>;
    }

    return (
      <div className="content-list">
        {contentList.map((item, index) => (
          <div key={index} className="content-item">
            <div className="content-item-header">
              <h4>{item.name}</h4>
              <div className="content-item-actions">
                <button onClick={() => {
 setFormData(item); setIsEditing(true);
}}>Edit</button>
                <button onClick={() => {
                  setCustomContent(prev => ({
                    ...prev,
                    [contentType + 's']: prev[contentType + 's' as keyof typeof prev].filter((_, i) => i !== index),
                  }));
                }}>Delete</button>
              </div>
            </div>
            <p className="content-item-description">{item.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="content-studio-panel">
      <div className="panel-header">
        <h1 > Content Studio</h1>
        <p > Create and edit custom moves, items, and spells</p>
      </div>

      <div className="panel-content">
        <div className="content-type-selector">
          <button
            className={`type-button ${contentType === 'move' ? 'active' : ''}`}
            onClick={() => setContentType('move')}
          >
            Moves
          </button>
          <button
            className={`type-button ${contentType === 'item' ? 'active' : ''}`}
            onClick={() => setContentType('item')}
          >
            Items
          </button>
          <button
            className={`type-button ${contentType === 'spell' ? 'active' : ''}`}
            onClick={() => setContentType('spell')}
          >
            Spells
          </button>
        </div>

        <div className="studio-layout">
          <div className="form-section">
                         <div className="form-header">
               <h2>{isEditing ? 'Edit' : 'Create'} {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</h2>
               <div className="form-actions">
                 {!isEditing && (
                   <>
                     <button className="template-button" onClick={() => setShowTemplates(true)}>
                       Templates
                     </button>
                     <button className="new-button" onClick={() => setIsEditing(true)}>
                       New {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                     </button>
                   </>
                 )}
               </div>
             </div>

            {isEditing && (
              <form className="content-form">
                {schema.fields.map(renderField)}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!validationResult.isValid}
                    className="save-button"
                  >
                    Save {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-button">
                    Cancel
                  </button>
                </div>

                {validationResult.errors.length > 0 && (
                  <div className="validation-errors">
                    <h4 > Errors:</h4>
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="error-message">{error.message}</div>
                    ))}
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="validation-warnings">
                    <h4 > Warnings:</h4>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="warning-message">{warning.message}</div>
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>

                     <div className="content-section">
             <div className="content-header">
               <h2 > Your Custom {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h2>
               <div className="content-actions">
                 <button className="import-button" onClick={() => setShowImportExport(true)}>
                   Import / Export
                 </button>
               </div>
             </div>
             {renderContentList()}
           </div>
                 </div>
       </div>

       {/* Templates Modal */}
       {showTemplates && (
         <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3 > Choose Template</h3>
               <button className="close-button" onClick={() => setShowTemplates(false)}>×</button>
             </div>
             <div className="modal-body">
               <div className="templates-grid">
                 {contentImportExportService.getTemplates(contentType).map(template => (
                   <div key={template.id} className="template-card" onClick={() => handleTemplateSelect(template)}>
                     <h4>{template.name}</h4>
                     <p>{template.description}</p>
                     <div className="template-tags">
                       {template.tags?.map(tag => (
                         <span key={tag} className="template-tag">{tag}</span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Import / Export Modal */}
       {showImportExport && (
         <div className="modal-overlay" onClick={() => setShowImportExport(false)}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3 > Import / Export {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h3>
               <button className="close-button" onClick={() => setShowImportExport(false)}>×</button>
             </div>
             <div className="modal-body">
               <div className="import-export-tabs">
                 <div className="tab-buttons">
                   <button className="tab-button active">Export</button>
                   <button className="tab-button">Import</button>
                 </div>

                 <div className="tab-content">
                   <div className="export-section">
                     <h4 > Export {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h4>
                     <p > Copy the JSON below to export your custom {contentType}s:</p>
                     <textarea
                       className="export-textarea"
                       value={exportData}
                       readOnly
                       rows={10}
                       aria-label="Export JSON data"
                       title="Export JSON data"
                     />
                     <button className="copy-button" onClick={() => navigator.clipboard.writeText(exportData)}>
                       Copy to Clipboard
                     </button>
                   </div>

                   <div className="import-section">
                     <h4 > Import {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h4>
                     <p > Paste JSON data to import {contentType}s:</p>
                     <textarea
                       className="import-textarea"
                       placeholder="Paste JSON data here..."
                       rows={10}
                       aria-label="Import JSON data"
                       title="Import JSON data"
                       onChange={(e) => {
                         if (e.target.value.trim()) {
                           handleImport(e.target.value);
                         }
                       }}
                     />
                     {importResult && (
                       <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                         <h5 > Import Result:</h5>
                         <p > Imported: {importResult.imported} items</p>
                         {importResult.errors.length > 0 && (
                           <div className="import-errors">
                             <h6 > Errors:</h6>
                             <ul>
                               {importResult.errors.map((error: string, index: number) => (
                                 <li key={index}>{error}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {importResult.warnings.length > 0 && (
                           <div className="import-warnings">
                             <h6 > Warnings:</h6>
                             <ul>
                               {importResult.warnings.map((warning: string, index: number) => (
                                 <li key={index}>{warning}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

// Export the panel instance for registration
export const ContentStudioPanelInstance: Panel = {
  metadata: {
    id: 'content-studio',
    name: 'Content Studio',
    icon: '🎨',
    description: 'Create and edit custom moves, items, and spells',
    priority: 50,
  },
  component: ContentStudioPanel,
};

export default ContentStudioPanel;
