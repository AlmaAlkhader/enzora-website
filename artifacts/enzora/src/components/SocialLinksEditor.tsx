import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSocialLinks,
  useUpdateSocialLinks,
  getGetSocialLinksQueryKey,
} from "@workspace/api-client-react";
import type { SocialLinksInput } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SOCIAL_PLATFORMS, type SocialPlatformKey } from "@/components/SocialIcons";

type FormState = Record<SocialPlatformKey, string>;

const EMPTY_FORM: FormState = {
  instagram: "",
  facebook: "",
  linkedin: "",
  tiktok: "",
};

export function SocialLinksEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetSocialLinks();
  const update = useUpdateSocialLinks();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    hydratedRef.current = true;
    setForm({
      instagram: data.instagram ?? "",
      facebook: data.facebook ?? "",
      linkedin: data.linkedin ?? "",
      tiktok: data.tiktok ?? "",
    });
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SocialLinksInput = {
      instagram: form.instagram.trim() ? form.instagram.trim() : null,
      facebook: form.facebook.trim() ? form.facebook.trim() : null,
      linkedin: form.linkedin.trim() ? form.linkedin.trim() : null,
      tiktok: form.tiktok.trim() ? form.tiktok.trim() : null,
    };
    update.mutate(
      { data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSocialLinksQueryKey() });
          toast({ title: "Social links updated" });
        },
        onError: () => {
          toast({ title: "Failed to update social links", variant: "destructive" });
        },
      },
    );
  };

  const handleClear = (key: SocialPlatformKey) => {
    setForm((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="font-medium">Social links</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Leave a field empty to disable that platform's icon across the site.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {SOCIAL_PLATFORMS.map(({ key, name, placeholder, Icon }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`social-${key}`} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {name}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`social-${key}`}
                type="url"
                inputMode="url"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                disabled={isLoading || update.isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClear(key)}
                disabled={isLoading || update.isPending || !form[key]}
              >
                Clear
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading || update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
