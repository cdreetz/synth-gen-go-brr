import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">AI Training Tools</h1>
        <p className="text-xl text-muted-foreground">
          Streamline your AI model training workflow with our suite of tools
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Auto Finetuning Dataset Generator</CardTitle>
            <CardDescription>
              Generate high-quality synthetic datasets for model finetuning
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/generator">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Eval Generator</CardTitle>
            <CardDescription>
              Create comprehensive evaluation datasets to test model performance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auto-eval">
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Prompt Optimizer</CardTitle>
            <CardDescription>
              Optimize your prompts automatically for better model responses
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="secondary" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
