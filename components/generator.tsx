"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

type Pair = {
  instruction: string;
  answer: string;
};

type ModelOption = {
  id: string;
  name: string;
  description: string;
};

export function Generator() {
  const [domain, setDomain] = useState("pharmacology");
  const [exampleType, setExampleType] = useState("instruction");
  const [numExamples, setNumExamples] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama-3.2-90b-vision-preview");
  const { toast } = useToast();

  const modelOptions: ModelOption[] = [
    {
      id: "llama-3.2-90b-vision-preview",
      name: "Llama 3.2 90B",
      description: "Most capable, slower generation",
    },
    {
      id: "llama-3.2-11b-vision-preview",
      name: "Llama 3.2 11B",
      description: "Balanced performance",
    },
    {
      id: "llama-3.2-3b-preview",
      name: "Llama 3.2 3B",
      description: "Fast, good for simple tasks",
    },
    {
      id: "llama-3.2-1b-preview",
      name: "Llama 3.2 1B",
      description: "Fastest, basic capabilities",
    },
  ];

  const generatePairs = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          exampleType,
          numExamples: parseInt(numExamples),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      setPairs(data);

      toast({
        title: "Generation Complete",
        description: `Generated ${data.length} instruction-answer pairs`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description:
          "There was an error generating the pairs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(pairs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${domain}-${exampleType}-pairs.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto py-10 flex gap-8">
      <div className="w-1/2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Instruction Generator</CardTitle>
            <CardDescription>
              Generate synthetic instruction-answer pairs for training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain..."
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="type">Example Type</Label>
                <Select value={exampleType} onValueChange={setExampleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select example type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qa">Q&A</SelectItem>
                    <SelectItem value="dialogue">Dialogue</SelectItem>
                    <SelectItem value="instruction">Instruction</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="few_shot">Few Shot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="number">Number of Examples</Label>
                <Input
                  id="number"
                  type="number"
                  value={numExamples}
                  onChange={(e) => setNumExamples(e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((model) => (
                      <SelectItem 
                        key={model.id} 
                        value={model.id}
                        className="flex flex-col items-start"
                      >
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={generatePairs}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Pairs"}
            </Button>
          </CardFooter>
        </Card>

        {pairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Export or manipulate your generated pairs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={exportToJson}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
              {/* Future actions can be added here */}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-1/2">
        {pairs.length > 0 && (
          <div className="space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto pr-4">
            {pairs.map((pair, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Pair {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Instruction:</h4>
                      <p className="mt-1 text-sm">{pair.instruction}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Answer:</h4>
                      <p className="mt-1 text-sm">{pair.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
