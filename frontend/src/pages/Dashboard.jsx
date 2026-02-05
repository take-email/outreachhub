import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { toast } from "sonner";
import {
  Users,
  Send,
  MessageCircle,
  TrendingUp,
  Sparkles,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Filter,
  X,
  ExternalLink,
  StickyNote,
  Copy,
} from "lucide-react";
import { statsApi, outreachApi, toolsApi, foundersApi, profilesApi } from "../api";
import { StatusBadge, statusOptions } from "../components/StatusBadge";
import MessageGeneratorModal from "../components/MessageGeneratorModal";
import { format } from "date-fns";

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-violet-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const NoteDialog = ({ open, onOpenChange, record, onSave }) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setNote(record.note || "");
    }
  }, [record, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await outreachApi.update(record.id, { note });
      toast.success("Note saved");
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="note-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-violet-600" />
            Note for {record?.founder?.founder_name}
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this outreach..."
          rows={5}
          className="resize-none"
          data-testid="note-textarea"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-violet-700 hover:bg-violet-800"
            data-testid="save-note-btn"
          >
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MessageDialog = ({ open, onOpenChange, record }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(record?.generated_message || "");
    toast.success("Message copied!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="message-dialog">
        <DialogHeader>
          <DialogTitle>Generated Message</DialogTitle>
        </DialogHeader>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          {record?.generated_message || "No message generated"}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleCopy}
            className="bg-violet-700 hover:bg-violet-800"
            data-testid="copy-message-btn"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_founders: 0,
    total_messages_sent: 0,
    total_replies: 0,
    reply_rate: 0,
  });
  const [records, setRecords] = useState([]);
  const [tools, setTools] = useState([]);
  const [founders, setFounders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [noteRecord, setNoteRecord] = useState(null);
  const [messageRecord, setMessageRecord] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    tool_id: "",
    founder_id: "",
    fb_profile_id: "",
    status: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [statsRes, recordsRes, toolsRes, foundersRes, profilesRes] = await Promise.all([
        statsApi.get(),
        outreachApi.getAll(Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        )),
        toolsApi.getAll(),
        foundersApi.getAll(),
        profilesApi.getAll(),
      ]);
      setStats(statsRes.data);
      setRecords(recordsRes.data);
      setTools(toolsRes.data);
      setFounders(foundersRes.data);
      setProfiles(profilesRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      await outreachApi.update(recordId, { status: newStatus });
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await outreachApi.delete(recordId);
      toast.success("Record deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const clearFilters = () => {
    setFilters({
      tool_id: "",
      founder_id: "",
      fb_profile_id: "",
      status: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your founder outreach campaigns</p>
        </div>
        <Button 
          onClick={() => setShowGenerator(true)}
          className="bg-violet-700 hover:bg-violet-800"
          data-testid="new-outreach-btn"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Outreach
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Founders"
          value={stats.total_founders}
          icon={Users}
        />
        <StatCard
          title="Messages Sent"
          value={stats.total_messages_sent}
          icon={Send}
        />
        <StatCard
          title="Total Replies"
          value={stats.total_replies}
          icon={MessageCircle}
        />
        <StatCard
          title="Reply Rate"
          value={`${stats.reply_rate}%`}
          icon={TrendingUp}
          subtitle="Based on sent messages"
        />
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters-btn">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select 
              value={filters.tool_id} 
              onValueChange={(v) => setFilters(f => ({ ...f, tool_id: v === "all" ? "" : v }))}
            >
              <SelectTrigger data-testid="filter-tool">
                <SelectValue placeholder="All Tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tools</SelectItem>
                {tools.map(tool => (
                  <SelectItem key={tool.id} value={tool.id}>{tool.tool_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.founder_id} 
              onValueChange={(v) => setFilters(f => ({ ...f, founder_id: v === "all" ? "" : v }))}
            >
              <SelectTrigger data-testid="filter-founder">
                <SelectValue placeholder="All Founders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Founders</SelectItem>
                {founders.map(founder => (
                  <SelectItem key={founder.id} value={founder.id}>{founder.founder_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.fb_profile_id} 
              onValueChange={(v) => setFilters(f => ({ ...f, fb_profile_id: v === "all" ? "" : v }))}
            >
              <SelectTrigger data-testid="filter-profile">
                <SelectValue placeholder="All Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>{profile.profile_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(v) => setFilters(f => ({ ...f, status: v === "all" ? "" : v }))}
            >
              <SelectTrigger data-testid="filter-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Outreach Records Table */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Outreach Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No outreach records yet</h3>
              <p className="text-slate-500 mt-1">Generate your first outreach message to get started</p>
              <Button 
                onClick={() => setShowGenerator(true)}
                className="mt-4 bg-violet-700 hover:bg-violet-800"
                data-testid="empty-state-new-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                New Outreach
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-header">
                    <TableHead>Founder</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>FB Profile</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{record.founder?.founder_name}</p>
                          {record.founder?.social_profile_url && (
                            <a 
                              href={record.founder.social_profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                            >
                              Profile <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{record.tool?.tool_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{record.facebook_profile?.profile_name}</span>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={record.status}
                          onValueChange={(v) => handleStatusChange(record.id, v)}
                        >
                          <SelectTrigger 
                            className="w-[130px] h-8 border-0 bg-transparent p-0"
                            data-testid={`status-select-${record.id}`}
                          >
                            <StatusBadge status={record.status} />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {record.note ? (
                          <button
                            onClick={() => setNoteRecord(record)}
                            className="text-xs text-slate-600 max-w-[150px] truncate block hover:text-violet-600"
                            title={record.note}
                            data-testid={`view-note-${record.id}`}
                          >
                            {record.note}
                          </button>
                        ) : (
                          <button
                            onClick={() => setNoteRecord(record)}
                            className="text-xs text-slate-400 hover:text-violet-600"
                            data-testid={`add-note-${record.id}`}
                          >
                            + Add note
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">
                          {format(new Date(record.updated_at), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`actions-${record.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setMessageRecord(record)}
                              data-testid={`view-message-${record.id}`}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              View Message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setNoteRecord(record)}
                              data-testid={`edit-note-${record.id}`}
                            >
                              <StickyNote className="w-4 h-4 mr-2" />
                              {record.note ? "Edit Note" : "Add Note"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600"
                              data-testid={`delete-${record.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MessageGeneratorModal
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onSuccess={loadData}
      />

      <NoteDialog
        open={!!noteRecord}
        onOpenChange={() => setNoteRecord(null)}
        record={noteRecord}
        onSave={loadData}
      />

      <MessageDialog
        open={!!messageRecord}
        onOpenChange={() => setMessageRecord(null)}
        record={messageRecord}
      />
    </div>
  );
};

export default Dashboard;
