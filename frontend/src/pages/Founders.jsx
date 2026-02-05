import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { Plus, Pencil, Trash2, Users, ExternalLink, RefreshCw } from "lucide-react";
import { foundersApi, toolsApi } from "../api";

const FounderFormDialog = ({ open, onOpenChange, founder, tools, onSave }) => {
  const [formData, setFormData] = useState({
    founder_name: "",
    social_profile_url: "",
    tool_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (founder) {
      setFormData({
        founder_name: founder.founder_name || "",
        social_profile_url: founder.social_profile_url || "",
        tool_id: founder.tool_id || "",
      });
    } else {
      setFormData({
        founder_name: "",
        social_profile_url: "",
        tool_id: "",
      });
    }
  }, [founder, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.founder_name.trim()) {
      toast.error("Founder name is required");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        tool_id: formData.tool_id || null,
      };
      if (founder) {
        await foundersApi.update(founder.id, data);
        toast.success("Founder updated");
      } else {
        await foundersApi.create(data);
        toast.success("Founder created");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error(founder ? "Failed to update founder" : "Failed to create founder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="founder-form-dialog">
        <DialogHeader>
          <DialogTitle>{founder ? "Edit Founder" : "Add New Founder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="founder_name">Founder Name *</Label>
            <Input
              id="founder_name"
              value={formData.founder_name}
              onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
              placeholder="e.g., John Doe"
              data-testid="founder-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social_profile_url">Social Profile URL</Label>
            <Input
              id="social_profile_url"
              value={formData.social_profile_url}
              onChange={(e) => setFormData({ ...formData, social_profile_url: e.target.value })}
              placeholder="https://facebook.com/johndoe"
              data-testid="founder-social-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool_id">Linked Tool</Label>
            <Select 
              value={formData.tool_id} 
              onValueChange={(v) => setFormData({ ...formData, tool_id: v })}
            >
              <SelectTrigger id="tool_id" data-testid="founder-tool-select">
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No tool</SelectItem>
                {tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.tool_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-violet-700 hover:bg-violet-800"
              data-testid="save-founder-btn"
            >
              {saving ? "Saving..." : founder ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Founders = () => {
  const [founders, setFounders] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFounder, setEditingFounder] = useState(null);
  const [deletingFounder, setDeletingFounder] = useState(null);

  const loadData = async () => {
    try {
      const [foundersRes, toolsRes] = await Promise.all([
        foundersApi.getAll(),
        toolsApi.getAll(),
      ]);
      setFounders(foundersRes.data);
      setTools(toolsRes.data);
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
      await foundersApi.delete(deletingFounder.id);
      toast.success("Founder deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete founder");
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
    <div className="space-y-6" data-testid="founders-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Founders</h1>
          <p className="text-slate-500 mt-1">Manage founders you're reaching out to</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="add-founder-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Founder
        </Button>
      </div>

      {/* Founders Table */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          {founders.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No founders yet</h3>
              <p className="text-slate-500 mt-1">Add your first founder to get started</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-add-founder-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Founder
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Founder</TableHead>
                  <TableHead>Linked Tool</TableHead>
                  <TableHead>Social Profile</TableHead>
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
                        <span className="font-medium text-slate-900">{founder.founder_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {founder.tool ? (
                        <span className="text-slate-600">{founder.tool.tool_name}</span>
                      ) : (
                        <span className="text-slate-400">No tool linked</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {founder.social_profile_url ? (
                        <a
                          href={founder.social_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
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
                          data-testid={`edit-founder-${founder.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingFounder(founder)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-founder-${founder.id}`}
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

      <FounderFormDialog
        open={showForm}
        onOpenChange={handleFormClose}
        founder={editingFounder}
        tools={tools}
        onSave={loadData}
      />

      <AlertDialog open={!!deletingFounder} onOpenChange={() => setDeletingFounder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Founder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFounder?.founder_name}"? This will also delete all associated outreach records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-founder"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Founders;
