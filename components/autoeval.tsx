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
import { Download, Pencil, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import InfoButton from "@/components/infobutton";

type Pair = {
  question: string;
  answer: string;
};

type ModelOption = {
  id: string;
  name: string;
  description: string;
};

export function AutoEval() {
  const [domain, setDomain] = useState("general");
  const [numExamples, setNumExamples] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama-3.2-90b-vision-preview");
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
          exampleType: "qa",
          numExamples: parseInt(numExamples),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      setPairs(data.map((pair: any) => ({
        question: pair.instruction,
        answer: pair.answer
      })));

      toast({
        title: "Generation Complete",
        description: `Generated ${data.length} evaluation pairs`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating the pairs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(pairs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${domain}-eval-pairs.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const updatePairAnswer = (index: number, newAnswer: string) => {
    const updatedPairs = [...pairs];
    updatedPairs[index] = {
      ...updatedPairs[index],
      answer: newAnswer,
    };
    setPairs(updatedPairs);
  };

  return (
    <div className="container mx-auto py-5 flex gap-8 relative">
      <div className="absolute left-0 -top-5">
        <InfoButton title="How to Use the Evaluator">
          <div className="space-y-2">
            <p className="mb-2">Follow these steps to generate evaluation question-answer pairs:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enter a domain for the evaluation questions (e.g., `general`, `science`, `math`)</li>
              <li>Select the number of evaluation pairs to generate (1-10)</li>
              <li>Choose a model based on your needs - larger models are more capable but slower</li>
              <li>After generation, you can edit answers and export the pairs as JSON</li>
              <li>Use these pairs to evaluate your LLM pipeline performance</li>
            </ul>
          </div>
        </InfoButton>
      </div>

      <div className="w-1/2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Generator</CardTitle>
            <CardDescription>
              Generate question-answer pairs for LLM evaluation
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
              {isGenerating ? "Generating..." : "Generate Evaluation Pairs"}
            </Button>
          </CardFooter>
        </Card>

        {pairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Export your evaluation pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportToJson}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-1/2">
        <div className="space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto pr-4">
          {pairs.length > 0 ? (
            pairs.map((pair, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Evaluation Pair {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Question:</h4>
                      <p className="mt-1 text-sm">{pair.question}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Answer:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (editingIndex === index) {
                              setEditingIndex(null);
                            } else {
                              setEditingIndex(index);
                            }
                          }}
                        >
                          {editingIndex === index ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {editingIndex === index ? (
                        <Textarea
                          value={pair.answer}
                          onChange={(e) => updatePairAnswer(index, e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      ) : (
                        <p className="mt-1 text-sm whitespace-pre-wrap">{pair.answer}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>
                  Generated evaluation pairs will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Configure your settings and click Generate Evaluation Pairs to begin
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
