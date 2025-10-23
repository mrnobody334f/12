import { useState } from "react";
import { Plus, X, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CustomSite {
  id: string;
  name: string;
  url: string;
  domain: string;
}

interface CustomSiteManagerProps {
  onSiteAdd: (site: CustomSite) => void;
  onSiteRemove: (siteId: string) => void;
  customSites: CustomSite[];
}

export function CustomSiteManager({ onSiteAdd, onSiteRemove, customSites }: CustomSiteManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const { toast } = useToast();

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace('www.', '').split('/')[0];
    }
  };

  const handleAddSite = () => {
    if (!siteName.trim() || !siteUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الموقع والرابط",
        variant: "destructive",
      });
      return;
    }

    const domain = extractDomain(siteUrl);
    const newSite: CustomSite = {
      id: `custom-${Date.now()}`,
      name: siteName.trim(),
      url: siteUrl.trim(),
      domain,
    };

    onSiteAdd(newSite);
    setSiteName("");
    setSiteUrl("");
    setIsOpen(false);
    
    toast({
      title: "تم إضافة الموقع",
      description: `تم إضافة ${newSite.name} بنجاح`,
    });
  };

  return (
    <div className="space-y-3">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة موقع مخصص
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة موقع مخصص</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">اسم الموقع</label>
              <Input
                placeholder="مثال: موقعي المفضل"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">رابط الموقع</label>
              <Input
                placeholder="أدخل رابط الموقع (مثال: example.com)"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSite} className="flex-1">
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {customSites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">المواقع المخصصة</h4>
          <div className="space-y-1">
            {customSites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{site.name}</span>
                  <span className="text-xs text-muted-foreground">({site.domain})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSiteRemove(site.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



