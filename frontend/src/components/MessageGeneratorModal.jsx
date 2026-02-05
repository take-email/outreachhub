import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { foundersApi, profilesApi, outreachApi } from "../api";

export const MessageGeneratorModal = ({ open, onOpenChange, onSuccess }) => {
  const [founders, setFounders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
      setSelectedFounder("");
      setSelectedProfile("");
      setGeneratedMessage("");
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foundersRes, profilesRes] = await Promise.all([
        foundersApi.getAll(),
        profilesApi.getAll(),
      ]);
      setFounders(foundersRes.data);
      setProfiles(profilesRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFounder || !selectedProfile) {
      toast.error("Please select both a founder and a profile");
      return;
    }

    const founder = founders.find(f => f.id === selectedFounder);
    const profile = profiles.find(p => p.id === selectedProfile);

    if (!founder?.tool) {
      toast.error("Selected founder has no linked tool");
      return;
    }

    if (!profile?.template_id) {
      toast.error("Selected profile has no linked template");
      return;
    }

    setGenerating(true);
    try {
      const response = await outreachApi.generate({
        founder_id: selectedFounder,
        fb_profile_id: selectedProfile,
      });
      setGeneratedMessage(response.data.generated_message);
      toast.success("Message generated successfully!");
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to generate message";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success("Message copied to clipboard!");
  };

  const foundersWithTool = founders.filter(f => f.tool);
  const profilesWithTemplate = profiles.filter(p => p.template_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="message-generator-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Generate Outreach Message
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="founder">Select Founder</Label>
                <Select value={selectedFounder} onValueChange={setSelectedFounder}>
                  <SelectTrigger id="founder" data-testid="select-founder">
                    <SelectValue placeholder="Choose a founder" />
                  </SelectTrigger>
                  <SelectContent>
                    {foundersWithTool.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-slate-500 text-center">
                        No founders with linked tools
                      </div>
                    ) : (
                      foundersWithTool.map((founder) => (
                        <SelectItem key={founder.id} value={founder.id}>
                          {founder.founder_name} ({founder.tool?.tool_name})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile">Select FB Profile</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger id="profile" data-testid="select-profile">
                    <SelectValue placeholder="Choose a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profilesWithTemplate.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-slate-500 text-center">
                        No profiles with linked templates
                      </div>
                    ) : (
                      profilesWithTemplate.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.profile_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedFounder || !selectedProfile}
              className="w-full bg-violet-700 hover:bg-violet-800"
              data-testid="generate-message-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Message
                </>
              )}
            </Button>

            {generatedMessage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Generated Message</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="copy-message-btn"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={generatedMessage}
                  readOnly
                  className="min-h-[200px] font-mono text-sm bg-slate-50"
                  data-testid="generated-message-textarea"
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageGeneratorModal;
