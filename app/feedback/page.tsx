"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { LineSpinner } from "ldrs/react";
import "ldrs/react/LineSpinner.css";

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [nextUrl, setNextUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNextUrl(`${window.location.origin}/feedback?success=true`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackType || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    try {
      // The form will be sent automatically to formsubmit.co
      // We don't need to handle the submission manually
      console.log("Sending feedback:", { feedbackType, message, email });

      // Simulate a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // The form will be sent automatically
      // formsubmit.co will handle the email sending
    } catch (error) {
      console.error("Error sending feedback:", error);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Redirect to home page after showing success message
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link
              href="/"
              className="flex items-center justify-center w-8 h-8 mx-auto mb-4"
            >
              <Image
                src="/logo.png"
                alt="Tablium"
                width={100}
                height={100}
                className="w-full h-full object-cover dark:invert-0 invert"
              />
            </Link>
            <h1 className="text-2xl font-bold">Send us your feedback</h1>
            <p>Your opinion helps us improve Tablium</p>
          </div>
          <div>
            <form
              action="https://formsubmit.co/supradivinohost@gmail.com"
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Configuration hidden fields */}
              <input
                type="hidden"
                name="_subject"
                value="New Tablium feedback"
              />
              <input type="hidden" name="_next" value={nextUrl} />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />

              {/* Feedback type select */}
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback type</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">💡 Idea or suggestion</SelectItem>
                    <SelectItem value="error">🐛 Error or bug</SelectItem>
                    <SelectItem value="opinion">💭 General opinion</SelectItem>
                    <SelectItem value="feature">✨ Feature request</SelectItem>
                    <SelectItem value="improvement">🔧 Improvement</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
                </Select>
                {/* Hidden field to send selected type */}
                <input
                  type="hidden"
                  name="tipo_de_feedback"
                  value={feedbackType}
                />
              </div>

              {/* Message textarea */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="mensaje"
                  placeholder="Write whatever you want"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none mt-2 p-2 table-scroll"
                  required
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting || !feedbackType || !message.trim()}
              >
                {isSubmitting ? (
                  <>
                    <LineSpinner
                      size="20"
                      stroke="3"
                      speed="1.1"
                      color="var(--background)"
                    />
                  </>
                ) : isSubmitted ? (
                  <>
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  "Send feedback"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
