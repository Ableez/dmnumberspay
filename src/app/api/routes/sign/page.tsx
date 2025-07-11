"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Signature, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { xdr } from "@stellar/stellar-sdk";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { Label } from "#/components/ui/label";
import { useMachine } from "@xstate/react";
import { machine } from "#/lib/xstate/auth-store";

type SignGuestbookProps = Record<string, never>;

const SignGuestbook: React.FC<SignGuestbookProps> = () => {
  const [state, send] = useMachine(machine);
  const router = useRouter();
  const [messageTitle, setMessageTitle] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // These would need to be replaced with your actual state management
  const contractId = localStorage.getItem("yog:contractId") || "";
  const keyId = localStorage.getItem("yog:keyId") || "";

  const signButtonDisabled = isLoading || !contractId;

  const signGuestbook = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // This would need to be replaced with your actual contract interaction
      const at = await ye_olde_guestbook.write_message({
        author: contractId,
        title: messageTitle,
        text: messageText,
      });

      let txn = await account.sign(at.built!, { keyId });
      const { returnValue } = await send(txn.built!);
      const messageId = xdr.ScVal.fromXDR(returnValue, 'base64').u32();

      toast.success("Huzzah!! You signed my guestbook! Thanks.");
      router.push(`/read/${messageId}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong signing the guestbook. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sign the Book</h1>
        <p className="text-muted-foreground">Join in on the age-old tradition, and sign my guestbook! Please.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="Title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            placeholder="Write your message here"
          />
        </div>

        <Button
          onClick={signGuestbook}
          disabled={signButtonDisabled}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Signature className="mr-2 h-4 w-4" />
          )}
          Sign!
        </Button>
      </div>
    </div>
  );
};

export default SignGuestbook;
