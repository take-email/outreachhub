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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, ExternalLink, RefreshCw, Wrench } from "lucide-react";
import { foundersApi, toolsApi, toolFounderApi } from "../api";

const ToolFounderFormDialog = ({ open, onOpenChange, founder, onSave }) => {
  const [formData, setFormData] = useState({
    tool_name: "",
    tool_description: "",
    website_url: "",
    source_url: "",
    founder_name: "",
    social_profile_url: "",
  });
  const [saving, setSaving] = useState(false);
  const isEditing = !!founder;

  useEffect(() => {
    if (founder) {
      setFormData({
        tool_name: founder.tool?.tool_name || "",
        tool_description: founder.tool?.tool_description || "",
        website_url: founder.tool?.website_url || "",
        source_url: founder.tool?.source_url || "",
        founder_name: founder.founder_name || "",
        social_profile_url: founder.social_profile_url || "",
      });
    } else {
      setFormData({
        tool_name: "",
        tool_description: "",
        website_url: "",
        source_url: "",
        founder_name: "",
        social_profile_url: "",
      });
    }
  }, [founder, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tool_name.trim()) {
      toast.error("Tool name is required");
      return;
    }
    if (!formData.founder_name.trim()) {
      toast.error("Founder name is required");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        // Update tool
        if (founder.tool) {
          await toolsApi.update(founder.tool.id, {
            tool_name: formData.tool_name,
            tool_description: formData.tool_description,
            website_url: formData.website_url,
            source_url: formData.source_url,
          });
        }
        // Update founder
        await foundersApi.update(founder.id, {
          founder_name: formData.founder_name,
          social_profile_url: formData.social_profile_url,
        });
        toast.success("Updated successfully");
      } else {
        // Create tool + founder together
        await toolFounderApi.create(formData);
        toast.success("Tool & Founder created");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="tool-founder-form-dialog">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tool & Founder" : "Add New Tool & Founder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tool Section */}
          <div className="space-y-3 p-4 bg-violet-50 rounded-lg">
            <div className="flex items-center gap-2 text-violet-700 font-medium text-sm mb-2">
              <Wrench className="w-4 h-4" />
              Tool Information
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tool_name" className="text-xs">Tool Name *</Label>
                <Input
                  id="tool_name"
                  value={formData.tool_name}
                  onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
                  placeholder="e.g., Notion"
                  className="h-9"
                  data-testid="tool-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website_url" className="text-xs">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://notion.so"
                  className="h-9"
                  data-testid="tool-website-input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="source_url" className="text-xs">Source URL</Label>
              <Input
                id="source_url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="Where you found this tool"
                className="h-9"
                data-testid="tool-source-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tool_description" className="text-xs">Description</Label>
              <Textarea
                id="tool_description"
                value={formData.tool_description}
                onChange={(e) => setFormData({ ...formData, tool_description: e.target.value })}
                placeholder="Brief description of the tool"
                rows={2}
                className="resize-none"
                data-testid="tool-description-input"
              />
            </div>
          </div>

          {/* Founder Section */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm mb-2">
              <Users className="w-4 h-4" />
              Founder Information
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="founder_name" className="text-xs">Founder Name *</Label>
                <Input
                  id="founder_name"
                  value={formData.founder_name}
                  onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                  placeholder="e.g., Ivan Zhao"
                  className="h-9"
                  data-testid="founder-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="social_profile_url" className="text-xs">Social Profile URL</Label>
                <Input
                  id="social_profile_url"
                  value={formData.social_profile_url}
                  onChange={(e) => setFormData({ ...formData, social_profile_url: e.target.value })}
                  placeholder="https://facebook.com/founder"
                  className="h-9"
                  data-testid="founder-social-input"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-violet-700 hover:bg-violet-800"
              data-testid="save-tool-founder-btn"
            >
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ToolsFounders = () => {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFounder, setEditingFounder] = useState(null);
  const [deletingFounder, setDeletingFounder] = useState(null);

  const loadData = async () => {
    try {
      const foundersRes = await foundersApi.getAll();
      setFounders(foundersRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (founder) => {
    setEditingFounder(founder);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingFounder) return;
    try {
      // Delete founder first
      await foundersApi.delete(deletingFounder.id);
      // Delete tool if it exists
      if (deletingFounder.tool) {
        await toolsApi.delete(deletingFounder.tool.id);
      }
      toast.success("Deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeletingFounder(null);
    }
  };

  const handleFormClose = (open) => {
    setShowForm(open);
    if (!open) setEditingFounder(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tools-founders-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tools & Founders</h1>
          <p className="text-slate-500 mt-1">Manage tools and their founders together</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="add-tool-founder-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tool & Founder
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          {founders.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No entries yet</h3>
              <p className="text-slate-500 mt-1">Add your first tool & founder to get started</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-add-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tool & Founder
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Founder</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {founders.map((founder) => (
                  <TableRow key={founder.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
                          {founder.founder_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{founder.founder_name}</p>
                          {founder.social_profile_url && (
                            <a
                              href={founder.social_profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                            >
                              Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-700">{founder.tool?.tool_name || "-"}</p>
                        {founder.tool?.tool_description && (
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">
                            {founder.tool.tool_description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {founder.tool?.website_url ? (
                        <a
                          href={founder.tool.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          Visit <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {founder.tool?.source_url ? (
                        <a
                          href={founder.tool.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(founder)}
                          data-testid={`edit-${founder.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingFounder(founder)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-${founder.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ToolFounderFormDialog
        open={showForm}
        onOpenChange={handleFormClose}
        founder={editingFounder}
        onSave={loadData}
      />

      <AlertDialog open={!!deletingFounder} onOpenChange={() => setDeletingFounder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFounder?.founder_name}" and their associated tool? This will also delete all outreach records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToolsFounders;
