"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { useRef } from "react";

interface QRCodeModalProps {
  formId: string;
  formName: string;
}

export function QRCodeModal({ formId, formName }: QRCodeModalProps) {
  const publicUrl = `${window.location.origin}/responder/${formId}`;
  const qrRef = useRef<SVGSVGElement>(null);

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-${formName
          .replace(/\s+/g, "-")
          .toLowerCase()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="mr-2 h-4 w-4" /> QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Compartilhar Formulário: {formName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <QRCodeSVG
            value={publicUrl}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            marginSize={0}
            ref={qrRef}
          />
          <div className="w-full space-y-2">
            <Label htmlFor="link">Link Público</Label>
            <div className="flex gap-2">
              <Input id="link" value={publicUrl} readOnly />
              <Button onClick={copyLink}>Copiar</Button>
            </div>
          </div>
          <Button onClick={downloadQRCode} className="w-full bg-blue-300">
            Baixar QR Code (PNG)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
