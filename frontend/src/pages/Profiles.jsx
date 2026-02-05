import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
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
import { Plus, Pencil, Trash2, Facebook, RefreshCw } from "lucide-react";
import { profilesApi, templatesApi } from "../api";
import { format } from "date-fns";

const ProfileFormDialog = ({ open, onOpenChange, profile, templates, onSave }) => {
  const [formData, setFormData] = useState({
    profile_name: "",
    template_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        profile_name: profile.profile_name || "",
        template_id: profile.template_id || "",
      });
    } else {
      setFormData({
        profile_name: "",
        template_id: "",
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profile_name.trim()) {
      toast.error("Profile name is required");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        template_id: formData.template_id || null,
      };
      if (profile) {
        await profilesApi.update(profile.id, data);
        toast.success("Profile updated");
      } else {
        await profilesApi.create(data);
        toast.success("Profile created");
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error(profile ? "Failed to update profile" : "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="profile-form-dialog">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit FB Profile" : "Add New FB Profile"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_name">Profile Name *</Label>
            <Input
              id="profile_name"
              value={formData.profile_name}
              onChange={(e) => setFormData({ ...formData, profile_name: e.target.value })}
              placeholder="e.g., Profile 1"
              data-testid="profile-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template_id">Default Template</Label>
            <Select 
              value={formData.template_id || "none"} 
              onValueChange={(v) => setFormData({ ...formData, template_id: v === "none" ? "" : v })}
            >
              <SelectTrigger id="template_id" data-testid="profile-template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              All messages from this profile will use this template
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
              data-testid="save-profile-btn"
            >
              {saving ? "Saving..." : profile ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);

  const loadData = async () => {
    try {
      const [profilesRes, templatesRes] = await Promise.all([
        profilesApi.getAll(),
        templatesApi.getAll(),
      ]);
      setProfiles(profilesRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingProfile) return;
    try {
      await profilesApi.delete(deletingProfile.id);
      toast.success("Profile deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete profile");
    } finally {
      setDeletingProfile(null);
    }
  };

  const handleFormClose = (open) => {
    setShowForm(open);
    if (!open) setEditingProfile(null);
  };

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template?.template_name || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="profiles-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facebook Profiles</h1>
          <p className="text-slate-500 mt-1">Manage your 20 outreach profiles</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="add-profile-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {/* Profiles Table */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          {profiles.length === 0 ? (
            <div className="py-12 text-center">
              <Facebook className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No profiles yet</h3>
              <p className="text-slate-500 mt-1">Add your first Facebook profile to get started</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-add-profile-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Default Template</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Facebook className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">{profile.profile_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.template_id ? (
                        <span className="text-slate-600">{getTemplateName(profile.template_id)}</span>
                      ) : (
                        <span className="text-slate-400">No template</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {format(new Date(profile.created_at), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(profile)}
                          data-testid={`edit-profile-${profile.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeletingProfile(profile)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-profile-${profile.id}`}
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

      <ProfileFormDialog
        open={showForm}
        onOpenChange={handleFormClose}
        profile={editingProfile}
        templates={templates}
        onSave={loadData}
      />

      <AlertDialog open={!!deletingProfile} onOpenChange={() => setDeletingProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProfile?.profile_name}"? This will also delete all associated outreach records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-profile"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profiles;
