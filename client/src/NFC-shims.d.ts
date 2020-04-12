declare global {
    interface Window {
        NDEFReader: any;
        NDEFWriter: any;
    }

    // type NDEFReader = any;
    // type NDEFWriter = any;

    class NDEFReader {}
    class NDEFWriter {}
}
  
export {};