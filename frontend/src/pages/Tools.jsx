import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
import { Plus, Pencil, Trash2, Wrench, ExternalLink, RefreshCw } from "lucide-react";
import { toolsApi } from "../api";

const ToolCard = ({ tool, onEdit, onDelete }) => (
  <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 font-bold">
            {tool.tool_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{tool.tool_name}</h3>
            {tool.website_url && (
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-600 hover:underline flex items-center gap-1 mt-1"
              >
                Visit website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(tool)}
            data-testid={`edit-tool-${tool.id}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(tool)}
            className="text-red-600 hover:text-red-700"
            data-testid={`delete-tool-${tool.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {tool.tool_description && (
        <p className="text-sm text-slate-500 mt-3 line-clamp-2">{tool.tool_description}</p>
      )}
    </CardContent>
  </Card>
);

const ToolFormDialog = ({ open, onOpenChange, tool, onSave }) => {
  const [formData, setFormData] = useState({
    tool_name: "",
    tool_description: "",
    website_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tool) {
      setFormData({
        tool_name: tool.tool_name || "",
        tool_description: tool.tool_description || "",
        website_url: tool.website_url || "",
      });
    } else {
      setFormData({
        tool_name: "",
        tool_description: "",
        website_url: "",
      });
    }
  }, [tool, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tool_name.trim()) {
      toast.error("Tool name is required");
      return;
    }

    setSaving(true);
    try {
      if (tool) {
        await toolsApi.update(tool.id, formData);
        toast.success("Tool updated");
      } else {
        await toolsApi.create(formData);
        toast.success("Tool created");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error(tool ? "Failed to update tool" : "Failed to create tool");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="tool-form-dialog">
        <DialogHeader>
          <DialogTitle>{tool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tool_name">Tool Name *</Label>
            <Input
              id="tool_name"
              value={formData.tool_name}
              onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
              placeholder="e.g., Notion"
              data-testid="tool-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool_description">Description</Label>
            <Textarea
              id="tool_description"
              value={formData.tool_description}
              onChange={(e) => setFormData({ ...formData, tool_description: e.target.value })}
              placeholder="Brief description of the tool"
              rows={3}
              data-testid="tool-description-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
              data-testid="tool-url-input"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-violet-700 hover:bg-violet-800"
              data-testid="save-tool-btn"
            >
              {saving ? "Saving..." : tool ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Tools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [deletingTool, setDeletingTool] = useState(null);

  const loadTools = async () => {
    try {
      const response = await toolsApi.getAll();
      setTools(response.data);
    } catch (error) {
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTool) return;
    try {
      await toolsApi.delete(deletingTool.id);
      toast.success("Tool deleted");
      loadTools();
    } catch (error) {
      toast.error("Failed to delete tool");
    } finally {
      setDeletingTool(null);
    }
  };

  const handleFormClose = (open) => {
    setShowForm(open);
    if (!open) setEditingTool(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tools-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tools</h1>
          <p className="text-slate-500 mt-1">Manage tools you're doing outreach for</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="add-tool-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {/* Tools Grid */}
      {tools.length === 0 ? (
        <Card className="bg-white border border-slate-200">
          <CardContent className="py-12">
            <div className="text-center">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No tools yet</h3>
              <p className="text-slate-500 mt-1">Add your first tool to get started</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-add-tool-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onEdit={handleEdit}
              onDelete={setDeletingTool}
            />
          ))}
        </div>
      )}

      <ToolFormDialog
        open={showForm}
        onOpenChange={handleFormClose}
        tool={editingTool}
        onSave={loadTools}
      />

      <AlertDialog open={!!deletingTool} onOpenChange={() => setDeletingTool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTool?.tool_name}"? This will also delete all associated founders and outreach records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-tool"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tools;
