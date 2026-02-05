import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText, RefreshCw, Code } from "lucide-react";
import { templatesApi } from "../api";
import { format } from "date-fns";

const TemplateCard = ({ template, onEdit, onDelete }) => (
  <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{template.template_name}</h3>
            <p className="text-xs text-slate-400">
              Created {format(new Date(template.created_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(template)}
            data-testid={`edit-template-${template.id}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(template)}
            className="text-red-600 hover:text-red-700"
            data-testid={`delete-template-${template.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600 max-h-32 overflow-hidden">
        {template.template_content.slice(0, 200)}
        {template.template_content.length > 200 && "..."}
      </div>
    </CardContent>
  </Card>
);

const TemplateFormDialog = ({ open, onOpenChange, template, onSave }) => {
  const [formData, setFormData] = useState({
    template_name: "",
    template_content: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name || "",
        template_content: template.template_content || "",
      });
    } else {
      setFormData({
        template_name: "",
        template_content: "",
      });
    }
  }, [template, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.template_name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!formData.template_content.trim()) {
      toast.error("Template content is required");
      return;
    }

    setSaving(true);
    try {
      if (template) {
        await templatesApi.update(template.id, formData);
        toast.success("Template updated");
      } else {
        await templatesApi.create(formData);
        toast.success("Template created");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error(template ? "Failed to update template" : "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById("template_content");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = 
      formData.template_content.substring(0, start) + 
      placeholder + 
      formData.template_content.substring(end);
    setFormData({ ...formData, template_content: newContent });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="template-form-dialog">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Add New Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name *</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              placeholder="e.g., Friendly Introduction"
              data-testid="template-name-input"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template_content">Template Content *</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{founder_name}")}
                  className="text-xs"
                  data-testid="insert-founder-name"
                >
                  <Code className="w-3 h-3 mr-1" />
                  founder_name
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{tool_name}")}
                  className="text-xs"
                  data-testid="insert-tool-name"
                >
                  <Code className="w-3 h-3 mr-1" />
                  tool_name
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder("{tool_description}")}
                  className="text-xs"
                  data-testid="insert-tool-desc"
                >
                  <Code className="w-3 h-3 mr-1" />
                  tool_description
                </Button>
              </div>
            </div>
            <Textarea
              id="template_content"
              value={formData.template_content}
              onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
              placeholder="Hi {founder_name}, I came across {tool_name} and was impressed by..."
              rows={8}
              className="font-mono text-sm"
              data-testid="template-content-input"
            />
            <p className="text-xs text-slate-500">
              Use placeholders: {"{founder_name}"}, {"{tool_name}"}, {"{tool_description}"}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-violet-700 hover:bg-violet-800"
              data-testid="save-template-btn"
            >
              {saving ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await templatesApi.delete(deletingTemplate.id);
      toast.success("Template deleted");
      loadTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    } finally {
      setDeletingTemplate(null);
    }
  };

  const handleFormClose = (open) => {
    setShowForm(open);
    if (!open) setEditingTemplate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="templates-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Message Templates</h1>
          <p className="text-slate-500 mt-1">Create reusable outreach templates with placeholders</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="add-template-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="bg-white border border-slate-200">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No templates yet</h3>
              <p className="text-slate-500 mt-1">Create your first message template to get started</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-add-template-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={setDeletingTemplate}
            />
          ))}
        </div>
      )}

      <TemplateFormDialog
        open={showForm}
        onOpenChange={handleFormClose}
        template={editingTemplate}
        onSave={loadTemplates}
      />

      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.template_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-template"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
