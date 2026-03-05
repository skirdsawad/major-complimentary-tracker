'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (value: string) => void;
}

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

export function QrScannerDialog({ open, onOpenChange, onScan }: QrScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // Scanner may already be stopped
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    scannedRef.current = false;

    const timeoutId = setTimeout(() => {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scannedRef.current) {
            return;
          }
          scannedRef.current = true;
          onScan(decodedText);
          onOpenChange(false);
        },
        () => {
          // QR code not detected — ignore
        },
      ).catch(() => {
        // Camera access denied or unavailable
      });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, [open, onScan, onOpenChange, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point the camera at the ticket QR code to scan
          </DialogDescription>
        </DialogHeader>
        <div id={SCANNER_ELEMENT_ID} className="w-full overflow-hidden rounded-md" />
      </DialogContent>
    </Dialog>
  );
}
