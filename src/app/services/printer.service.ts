import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

export interface PrinterSettings {
  paperSize: '58mm' | '80mm';
  vendorId?: number;
  productId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private isBrowser: boolean;
  private usbDevice: any = null; // Use 'any' since WebUSB types are not natively in TS without dom.webusb
  
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.connectionStatus.asObservable();

  private settings: PrinterSettings = { paperSize: '58mm' };
  private readonly SETTINGS_KEY = 'storehub_printer_settings';

  // ESC/POS Commands
  private readonly ESC = '\x1B';
  private readonly GS = '\x1D';
  private readonly INIT = this.ESC + '@';
  private readonly CUT = this.GS + 'V\x00';
  private readonly BOLD_ON = this.ESC + 'E1';
  private readonly BOLD_OFF = this.ESC + 'E0';
  private readonly CENTER = this.ESC + 'a1';
  private readonly LEFT = this.ESC + 'a0';
  private readonly RIGHT = this.ESC + 'a2';
  private readonly DOUBLE_HEIGHT = this.ESC + '!\x10';
  private readonly DOUBLE_WIDTH = this.ESC + '!\x20';
  private readonly DOUBLE_ON = this.ESC + '!\x30';
  private readonly NORMAL_SIZE = this.ESC + '!\x00';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadSettings();
      this.initUsbListeners();
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      try {
        this.settings = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing printer settings');
      }
    }
  }

  public saveSettings(settings: PrinterSettings): void {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
  }

  public getSettings(): PrinterSettings {
    return { ...this.settings };
  }

  private initUsbListeners(): void {
    if (!('usb' in navigator)) return;
    
    (navigator as any).usb.addEventListener('disconnect', (event: any) => {
      if (this.usbDevice && event.device === this.usbDevice) {
        this.connectionStatus.next(false);
        this.usbDevice = null;
        this.snackBar.open('Impresora desconectada', 'Cerrar', { duration: 3000, panelClass: ['snackbar-warning'] });
      }
    });

    // Try to auto-connect if we have saved vendor/product IDs
    if (this.settings.vendorId && this.settings.productId) {
      this.autoConnect();
    }
  }

  private async autoConnect(): Promise<void> {
    if (!('usb' in navigator)) return;
    
    try {
      const devices = await (navigator as any).usb.getDevices();
      const savedDevice = devices.find((d: any) => 
        d.vendorId === this.settings.vendorId && 
        d.productId === this.settings.productId
      );
      
      if (savedDevice) {
        await this.connectToDevice(savedDevice);
      }
    } catch (error) {
      console.error('Error auto-connecting to printer:', error);
    }
  }

  public async connect(): Promise<boolean> {
    if (!this.isBrowser || !('usb' in navigator)) {
      this.snackBar.open('API WebUSB no soportada en este navegador (usa Chrome o Edge)', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
      return false;
    }

    try {
      // ClassCode 7 is for printers
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ classCode: 7 }] // Only show printers
      });
      
      await this.connectToDevice(device);
      
      // Save for auto-connect
      this.saveSettings({
        ...this.settings,
        vendorId: device.vendorId,
        productId: device.productId
      });
      
      return true;
    } catch (error: any) {
      console.error('Error selecting printer:', error);
      // Don't throw error if user just cancelled the dialog
      if (error instanceof Error && !error.message.includes('cancelled')) {
        throw error;
      }
      return false;
    }
  }

  private async connectToDevice(device: any): Promise<void> {
    try {
      await device.open();
      // Select configuration #1 (usually the only one)
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      // Claim the first interface
      await device.claimInterface(0);
      
      this.usbDevice = device;
      this.connectionStatus.next(true);
      this.snackBar.open('Impresora conectada exitosamente', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.usbDevice) {
      try {
        await this.usbDevice.close();
      } catch (error) {
        console.error('Error closing device', error);
      }
      this.usbDevice = null;
      this.connectionStatus.next(false);
      
      // Clear saved device info so it doesn't auto-connect
      this.saveSettings({ ...this.settings, vendorId: undefined, productId: undefined });
    }
  }

  public isConnected(): boolean {
    return this.connectionStatus.value;
  }

  // --- ESC/POS Building ---

  public async testPrint(): Promise<boolean> {
    let receipt = this.INIT;
    receipt += this.CENTER;
    receipt += this.DOUBLE_ON + "STOREHUB\n" + this.NORMAL_SIZE;
    receipt += "Impresora configurada\ncorrectamente.\n\n";
    receipt += this.LEFT;
    receipt += "Tamaño de rollo: " + this.settings.paperSize + "\n";
    receipt += "==============================\n\n";
    receipt += this.CENTER;
    receipt += "¡Gracias por usar StoreHub!\n\n\n\n\n\n\n";
    receipt += this.CUT;

    return this.printRaw(receipt);
  }

  public async printSaleTicket(sale: any): Promise<boolean> {
    if (!sale) return false;

    const storeName = this.authService.getStoreName() || 'STOREHUB';
    const storeAddress = this.authService.getStoreAddress() || '';
    const storePhone = this.authService.getStorePhone() || '';
    const storeReceiptMessage = this.authService.getStoreReceiptMessage() || '¡Gracias por tu compra!';

    const lineLen = this.settings.paperSize === '58mm' ? 32 : 48;
    
    let receipt = this.INIT;
    receipt += this.CENTER;
    
    // Store Info
    receipt += this.DOUBLE_HEIGHT + this.BOLD_ON + storeName.toUpperCase() + "\n" + this.NORMAL_SIZE + this.BOLD_OFF;
    if (storeAddress) receipt += storeAddress + "\n";
    if (storePhone) receipt += "Tel: " + storePhone + "\n";
    receipt += "\n";
    
    // Ticket Header
    receipt += this.BOLD_ON + "TICKET DE VENTA\n" + this.BOLD_OFF;
    receipt += `Venta #${sale.id}\n`;
    receipt += `Fecha: ${new Date(sale.created_at).toLocaleString()}\n`;
    if (sale.client_name) {
      receipt += `Cliente: ${sale.client_name}\n`;
    }
    receipt += "-".repeat(lineLen) + "\n";
    
    receipt += this.LEFT;
    
    // Items
    if (sale.details && Array.isArray(sale.details)) {
      for (const item of sale.details) {
        const qty = item.quantity.toString();
        const price = '$' + parseFloat(item.price_at_sale).toFixed(2);
        const name = item.product_name;
        
        // Print name
        receipt += name + "\n";
        
        // Print qty x price aligned to right
        const line = `${qty} x ${price}`;
        const total = '$' + (item.quantity * parseFloat(item.price_at_sale)).toFixed(2);
        
        const spaces = lineLen - line.length - total.length;
        receipt += line + " ".repeat(Math.max(1, spaces)) + total + "\n";
      }
    }
    
    receipt += "-".repeat(lineLen) + "\n";
    receipt += this.RIGHT;
    receipt += this.BOLD_ON + `SUBTOTAL: $${sale.subtotal}\n`;
    receipt += `IVA: $${sale.impuestos}\n`;
    receipt += this.DOUBLE_ON + `TOTAL: $${sale.total}\n` + this.NORMAL_SIZE + this.BOLD_OFF;
    
    receipt += "\n" + this.CENTER + storeReceiptMessage + "\n\n\n\n\n\n\n";
    receipt += this.CUT;

    return this.printRaw(receipt);
  }

  private async printRaw(data: string): Promise<boolean> {
    if (!this.usbDevice) {
      this.snackBar.open('Impresora no conectada', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
      return false;
    }

    try {
      // Encode string to Uint8Array using ISO-8859-1 for better basic character support (or UTF-8 if printer supports it)
      // Usually ESC/POS uses Code Page 437 or 858 by default. TextEncoder uses UTF-8.
      // For basic ASCII and Spanish (if we avoid accents for now or send raw bytes), UTF-8 might print garbage for accents on old printers.
      // To be safe, we'll replace common accents with unaccented letters for the thermal printer, then use TextEncoder.
      const sanitizedData = data
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
        .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U')
        .replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
        
      const encoder = new TextEncoder();
      const buffer = encoder.encode(sanitizedData);

      // Find the OUT endpoint (bulk or interrupt)
      let outEndpoint = null;
      for (const endpoint of this.usbDevice.configuration.interfaces[0].alternate.endpoints) {
        if (endpoint.direction === 'out') {
          outEndpoint = endpoint;
          break;
        }
      }

      if (!outEndpoint) {
        throw new Error('No se encontró el canal de salida en la impresora');
      }

      // Send the data
      await this.usbDevice.transferOut(outEndpoint.endpointNumber, buffer);
      return true;
    } catch (error) {
      console.error('Error printing:', error);
      this.snackBar.open('Error al enviar datos a la impresora', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
      return false;
    }
  }
}
