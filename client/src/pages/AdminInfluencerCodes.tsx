import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Copy, Crown, Gift } from "lucide-react";

export default function AdminInfluencerCodes() {
  const [influencerName, setInfluencerName] = useState("");
  const [codePrefix, setCodePrefix] = useState("INF");
  const [durationMonths, setDurationMonths] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const { toast } = useToast();

  const createCodesMutation = useMutation({
    mutationFn: async (data: {
      influencerName: string;
      codePrefix: string;
      durationMonths: number;
      quantity: number;
    }) => {
      return await apiRequest("/api/admin/create-influencer-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          grantsChirpPlus: true,
        }),
      });
    },
    onSuccess: (data) => {
      setGeneratedCodes(data.codes);
      toast({
        title: "Success!",
        description: data.message,
      });
      // Clear form
      setInfluencerName("");
      setCodePrefix("INF");
      setDurationMonths(3);
      setQuantity(1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create influencer codes",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencerName.trim()) {
      toast({
        title: "Error",
        description: "Influencer name is required",
        variant: "destructive",
      });
      return;
    }

    createCodesMutation.mutate({
      influencerName: influencerName.trim(),
      codePrefix,
      durationMonths,
      quantity,
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code ${code} copied to clipboard`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Influencer Code Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create one-time use codes for influencers to give them Chirp+ access
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Generate Influencer Codes
          </CardTitle>
          <CardDescription>
            Create unique codes that grant Chirp+ access for specified durations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="influencerName">Influencer Name</Label>
                <Input
                  id="influencerName"
                  value={influencerName}
                  onChange={(e) => setInfluencerName(e.target.value)}
                  placeholder="@username or Full Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codePrefix">Code Prefix</Label>
                <Select value={codePrefix} onValueChange={setCodePrefix}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INF">INF (Influencer)</SelectItem>
                    <SelectItem value="TECH">TECH (Tech Reviewer)</SelectItem>
                    <SelectItem value="STYLE">STYLE (Fashion)</SelectItem>
                    <SelectItem value="GAME">GAME (Gaming)</SelectItem>
                    <SelectItem value="ART">ART (Artist)</SelectItem>
                    <SelectItem value="VIP">VIP (Special)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Chirp+ Duration</Label>
                <Select value={durationMonths.toString()} onValueChange={(value) => setDurationMonths(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Codes</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Code</SelectItem>
                    <SelectItem value="3">3 Codes</SelectItem>
                    <SelectItem value="5">5 Codes</SelectItem>
                    <SelectItem value="10">10 Codes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={createCodesMutation.isPending}
            >
              {createCodesMutation.isPending ? "Generating..." : "Generate Codes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Generated Codes
            </CardTitle>
            <CardDescription>
              Share these codes with your influencers. Each code can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedCodes.map((codeData, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-mono text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {codeData.code}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {codeData.description}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(codeData.code)}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}